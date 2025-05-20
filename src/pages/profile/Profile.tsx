import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../utils/axios';
import { toast } from 'react-hot-toast';

interface UserProfile {
    name: string;
    email: string;
    profilePicture: string | null;
    role: string;
}

const Profile = () => {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        profilePicture: null as File | null
    });

    // Fetch user profile
    const { data: profile, isLoading } = useQuery<UserProfile>({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await axiosInstance.get('/api/user/profile');
            return response.data;
        }
    });

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const response = await axiosInstance.put('/api/user/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            setIsEditing(false);
            toast.success('Profile updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to update profile');
        }
    });

    // Forgot password mutation
    const forgotPasswordMutation = useMutation({
        mutationFn: async (email: string) => {
            const endpoint = profile?.role === 'ADMIN' 
                ? '/api/user/forgot-password/admin'
                : '/api/user/forgot-password/user';
            const response = await axiosInstance.post(endpoint, { email });
            return response.data;
        },
        onSuccess: () => {
            toast.success('Password reset instructions sent to your email');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to send reset instructions');
        }
    });

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({
                ...prev,
                profilePicture: e.target.files![0]
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('email', formData.email);
        if (formData.profilePicture) {
            formDataToSend.append('profilePicture', formData.profilePicture);
        }
        updateProfileMutation.mutate(formDataToSend);
    };

    const handleForgotPassword = () => {
        if (profile?.email) {
            forgotPasswordMutation.mutate(profile.email);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="relative">
                        <img
                            src={profile?.profilePicture || '/default-avatar.png'}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover"
                        />
                        {isEditing && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleProfilePictureChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{profile?.name}</h2>
                        <p className="text-gray-600">{profile?.email}</p>
                        <p className="text-sm text-gray-500 capitalize">{profile?.role}</p>
                    </div>
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                disabled={updateProfileMutation.isPending}
                                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                            >
                                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <button
                            onClick={() => {
                                setIsEditing(true);
                                setFormData({
                                    name: profile?.name || '',
                                    email: profile?.email || '',
                                    profilePicture: null
                                });
                            }}
                            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        >
                            Edit Profile
                        </button>
                        <button
                            onClick={handleForgotPassword}
                            disabled={forgotPasswordMutation.isPending}
                            className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50"
                        >
                            {forgotPasswordMutation.isPending ? 'Sending...' : 'Reset Password'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile; 