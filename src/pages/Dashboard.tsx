import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios';

interface AppConfig {
    appName: string;
    logoUrl: string | null;
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
            <div className="flex items-center justify-center mb-8">
                {appConfig?.logoUrl && (
                    <img 
                        src={appConfig.logoUrl} 
                        alt="App Logo" 
                        className="h-16 w-16 object-contain mr-4"
                    />
                )}
                <h1 className="text-3xl font-bold text-gray-900">
                    {appConfig?.appName || 'Dashboard'}
                </h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Add your dashboard widgets/cards here */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Welcome</h2>
                    <p className="text-gray-600">
                        This is your dashboard. You can add more widgets and features here.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 