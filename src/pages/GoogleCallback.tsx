import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const GoogleCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                setIsLoading(true);
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

                // Send the code to your backend
                const response = await axios.get(`http://localhost:5000/api/auth/google/callback?code=${code}`);
                
                if (response.data.error) {
                    throw new Error(response.data.error);
                }

                // Store the access token
                localStorage.setItem('gmail_access_token', response.data.accessToken);
                
                // Redirect to the dashboard
                navigate('/dashboard/gmail');
            } catch (error) {
                console.error('Error during authentication:', error);
                setError(error instanceof Error ? error.message : 'Authentication failed');
            } finally {
                setIsLoading(false);
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold mb-4 text-red-600">Authentication Error</h1>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/dashboard/gmail')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold mb-4">Processing Authentication...</h1>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                </div>
            </div>
        );
    }

    return null;
};

export default GoogleCallback; 