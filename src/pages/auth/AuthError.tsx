import { useNavigate } from 'react-router-dom';

const AuthError = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Authentication Error
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        There was a problem authenticating with Gmail. Please try again.
                    </p>
                </div>
                <div className="mt-8 space-y-4">
                    <button
                        onClick={() => navigate('/dashboard/gmail')}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthError; 