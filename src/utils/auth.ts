import axiosInstance from './axios';


export const initiateGoogleAuth = async () => {
    try {
        const response = await axiosInstance.get(`/api/auth/google`);
        // Open the auth URL in a new window
        window.location.href = response.data.authUrl;
    } catch (error) {
        console.error('Error initiating Google auth:', error);
        throw error;
    }
};

export const getGmailAccessToken = () => {
    return localStorage.getItem('gmail_access_token');
};

export const isGmailAuthenticated = () => {
    return !!getGmailAccessToken();
};

export const logoutGmail = () => {
    localStorage.removeItem('gmail_access_token');
}; 