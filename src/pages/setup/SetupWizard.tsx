import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../utils/axios';
import { toast } from 'react-hot-toast';
import LogoUpload from '../../components/LogoUpload/LogoUpload';

const SetupWizard = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        appName: '',
        logoUrl: '',
        adminEmail: '',
        adminName: '',
        adminPassword: '',
        confirmPassword: ''
    });

    const saveAppInfoMutation = useMutation({
        mutationFn: async (data: { appName: string; logoUrl: string }) => {
            const response = await axiosInstance.post('/api/setup/app-info', data);
            return response.data;
        },
        onSuccess: () => {
            setStep(2);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to save app information');
        }
    });

    const createAdminMutation = useMutation({
        mutationFn: async (data: { email: string; name: string; password: string }) => {
            const response = await axiosInstance.post('/api/setup/admin-account', data);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Setup completed successfully');
            window.location.href = '/login';
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to create admin account');
        }
    });

    const handleAppInfoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.appName) {
            toast.error('Please enter an app name');
            return;
        }
        saveAppInfoMutation.mutate({
            appName: formData.appName,
            logoUrl: formData.logoUrl
        });
    };

    const handleAdminSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.adminPassword !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        createAdminMutation.mutate({
            email: formData.adminEmail,
            name: formData.adminName,
            password: formData.adminPassword
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {step === 1 ? 'Configure Your Application' : 'Create Admin Account'}
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {step === 1 ? (
                        <form onSubmit={handleAppInfoSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="appName" className="block text-sm font-medium text-gray-700">
                                    Application Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="appName"
                                        name="appName"
                                        type="text"
                                        required
                                        value={formData.appName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, appName: e.target.value }))}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Application Logo
                                </label>
                                <LogoUpload
                                    currentLogo={formData.logoUrl}
                                    onLogoUpdate={(url) => setFormData(prev => ({ ...prev, logoUrl: url }))}
                                />
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={saveAppInfoMutation.isPending}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {saveAppInfoMutation.isPending ? 'Saving...' : 'Next'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleAdminSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="adminName" className="block text-sm font-medium text-gray-700">
                                    Admin Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="adminName"
                                        name="adminName"
                                        type="text"
                                        required
                                        value={formData.adminName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, adminName: e.target.value }))}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700">
                                    Admin Email
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="adminEmail"
                                        name="adminEmail"
                                        type="email"
                                        required
                                        value={formData.adminEmail}
                                        onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="adminPassword"
                                        name="adminPassword"
                                        type="password"
                                        required
                                        value={formData.adminPassword}
                                        onChange={(e) => setFormData(prev => ({ ...prev, adminPassword: e.target.value }))}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirm Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={createAdminMutation.isPending}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {createAdminMutation.isPending ? 'Creating...' : 'Complete Setup'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SetupWizard; 