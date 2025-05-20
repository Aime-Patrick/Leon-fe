import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '../../utils/axios';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    // Forgot password mutation
    const forgotPasswordMutation = useMutation({
        mutationFn: async (data: { email: string; isAdmin: boolean }) => {
            const endpoint = data.isAdmin ? '/api/user/forgot-password/admin' : '/api/user/forgot-password/user';
            const response = await axiosInstance.post(endpoint, { email: data.email });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.isAdmin) {
                toast.success('Password reset link has been sent to your email');
            } else {
                toast.success('OTP has been sent to your email');
            }
            // Redirect to login after successful submission
            navigate('/login');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to process request');
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // For now, we'll treat all requests as user requests
        // You can add logic here to determine if it's an admin request
        forgotPasswordMutation.mutate({ email, isAdmin: false });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Forgot your password?
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Enter your email address and we'll send you instructions to reset your password.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={forgotPasswordMutation.isPending}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {forgotPasswordMutation.isPending ? 'Sending...' : 'Send Reset Instructions'}
                            </button>
                        </div>

                        <div className="text-sm text-center">
                            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                Back to login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword; 