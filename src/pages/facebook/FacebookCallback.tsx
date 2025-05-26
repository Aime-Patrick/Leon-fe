import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../../utils/axios';

const FacebookCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const isProcessing = useRef(false);

    useEffect(() => {
        console.log('FacebookCallback useEffect triggered', {
            code: searchParams.get('code'),
            state: searchParams.get('state'),
            error: searchParams.get('error'),
            errorDescription: searchParams.get('error_description')
        });

        const handleCallback = async () => {
            // Prevent duplicate processing
            if (isProcessing.current) {
                console.log('Callback already being processed, skipping...');
                return;
            }

            try {
                isProcessing.current = true;
                // Get the code and state from URL parameters
                const code = searchParams.get('code');
                const state = searchParams.get('state');
                const error = searchParams.get('error');
                const errorDescription = searchParams.get('error_description');

                console.log('Processing callback with params:', { code, state, error, errorDescription });

                if (error) {
                    setError(errorDescription || 'Authentication failed');
                    setIsLoading(false);
                    return;
                }

                if (!code || !state) {
                    setError('Missing required parameters');
                    setIsLoading(false);
                    return;
                }

                // Call the backend to exchange the code for tokens
                console.log('Making backend request to /api/facebook/auth/callback');
                const response = await axiosInstance.get('/api/facebook/auth/callback', {
                    params: { code, state },
                    withCredentials: true // Ensure cookies are sent with the request
                });
                console.log('Received response from backend:', response.data);

                // If successful, redirect to the Facebook page
                if (response.data) {
                    // Update local storage with new Facebook data if needed
                    const user = JSON.parse(localStorage.getItem('user') || '{}');
                    const updatedUser = {
                        ...user,
                        facebookAccessToken: response.data.fbData.accessToken,
                        facebookAdAccountId: response.data.fbData.adAccountId,
                        facebookBusinessId: response.data.fbData.businessId
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));

                    // Get the stored session state
                    const storedState = sessionStorage.getItem('facebookOAuthState');
                    const returnUrl = storedState ? JSON.parse(storedState).returnUrl : '/facebook';

                    // Clear the stored state
                    sessionStorage.removeItem('facebookOAuthState');

                    // Redirect to the original page with success message
                    navigate(returnUrl, { 
                        state: { 
                            message: response.data.message,
                            status: response.data.status
                        },
                        replace: true
                    });
                }
            } catch (err: any) {
                console.error('Facebook callback error:', err);
                setError(err.response?.data?.message || 'Failed to connect Facebook account');
                setIsLoading(false);
            } finally {
                isProcessing.current = false;
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Connecting your Facebook account...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                    <div className="text-center">
                        <div className="text-red-500 mb-4">
                            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Failed</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/facebook')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Return to Facebook Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default FacebookCallback; 