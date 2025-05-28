import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axios';

const InstagramCallback: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const error = searchParams.get('error');
            const errorReason = searchParams.get('error_reason');
            const errorDescription = searchParams.get('error_description');

            if (error) {
                toast.error(`Instagram connection failed: ${errorDescription || errorReason || error}`);
                navigate('/instagram');
                return;
            }

            if (!code) {
                toast.error('No authorization code received from Instagram');
                navigate('/instagram');
                return;
            }

            try {
                await axiosInstance.get(`/api/instagram/callback?code=${code}`);
                toast.success('Successfully connected to Instagram');
                navigate('/instagram');
            } catch (error: any) {
                console.error('Instagram callback error:', error);
                const errorMessage = error.response?.data?.message || 'Failed to connect to Instagram';
                toast.error(errorMessage);
                navigate('/instagram');
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold">Connecting to Instagram...</h2>
                <p className="text-gray-600 mt-2">Please wait while we complete the connection</p>
            </div>
        </div>
    );
};

export default InstagramCallback; 