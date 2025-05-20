import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';

interface AppConfig {
    appName: string;
    appLogo: string | null;
}

const Dashboard = () => {
    const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAppConfig = async () => {
            try {
                const response = await axiosInstance.get('/api/app/config');
                setAppConfig(response.data);
            } catch (err) {
                setError('Failed to load app configuration');
                console.error('Error fetching app config:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAppConfig();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center">
                    {appConfig?.appLogo && (
                        <img
                            src={appConfig.appLogo}
                            alt={appConfig.appName}
                            className="mx-auto h-24 w-24 object-contain"
                        />
                    )}
                    <h1 className="mt-4 text-3xl font-bold text-gray-900">
                        Welcome to {appConfig?.appName || 'Leon'}
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Your all-in-one communication platform
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Gmail Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">Gmail</h3>
                                    <p className="text-sm text-gray-500">Manage your emails</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <a
                                    href="/gmail"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Open Gmail
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Add more service cards here */}
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 