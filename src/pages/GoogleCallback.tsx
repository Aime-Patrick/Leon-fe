import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const GoogleCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const code = searchParams.get('code');
                const error = searchParams.get('error');
                
                if (error) {
                    console.error('OAuth error:', error);
                    setError(`Authentication error: ${error}`);
                    return;
                }
                
                if (!code) {
                    throw new Error('No authorization code received');
                }

                // Step 1: Exchange code for tokens
                const response = await axiosInstance.get(`/api/auth/google/callback?code=${code}`);
                
                if (!response.data.success) {
                    throw new Error(response.data.error || 'Failed to exchange code for tokens');
                }

                // Step 2: Save tokens to database
                const saveResponse = await axiosInstance.post('/api/auth/gmail/save-tokens', {
                    access_token: response.data.access_token,
                    refresh_token: response.data.refresh_token,
                    expires_in: response.data.expires_in
                });

                if (!saveResponse.data.success) {
                    throw new Error('Failed to save Gmail tokens');
                }

                // Store the access token in localStorage
                localStorage.setItem('gmail_access_token', response.data.access_token);
                
                // Redirect to the Gmail page
                // navigate('/gmail');
            } catch (error) {
                console.error('Error during authentication:', error);
                setError(error instanceof Error ? error.message : 'Authentication failed');
            }
        };

        handleCallback();
    }, [searchParams]);

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold mb-4 text-red-600">Authentication Error</h1>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/gmail')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                        Return to Gmail
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h1 className="text-2xl font-semibold mb-4">Processing Authentication...</h1>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            </div>
        </div>
    );
};

export default GoogleCallback; 