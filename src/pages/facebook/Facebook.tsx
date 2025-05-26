import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { connectToFacebook, getBusinessInfo, getCampaigns, createPage, type BusinessInfo } from '../../api/facebookApi';
import type { Campaign, Page } from '../../api/facebookApi';
import {  FaPlus, FaEdit, FaChartLine } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axios';
import { usePage } from '../../hooks/usePages';

interface FacebookStatus {
    isConnected: boolean;
    businessInfo?: BusinessInfo;
    
}

interface CreatePostData {
    message: string;
    link?: string;
    image?: File;
    video?: File;
}

const Facebook = () => {
    const [user, setUser] = useState<any>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const {pages, isPagesLoading, pageError} = usePage()
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isCreatingPost, setIsCreatingPost] = useState(false);
    const [selectedPage, setSelectedPage] = useState<Page | null>(null);
    const [createPostData, setCreatePostData] = useState<CreatePostData>({
        message: '',
        link: '',
    });
    const [isCreatingPage, setIsCreatingPage] = useState(false);
    const [newPageData, setNewPageData] = useState({
        name: '',
        category: '',
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [location]);

    const { data: facebookStatus, isLoading: isStatusLoading, error: statusError } = useQuery<FacebookStatus, Error>({
        queryKey: ['facebook-status'],
        queryFn: async () => {
            try {
                const businessInfo = await getBusinessInfo();
                return {
                    isConnected: true,
                    businessInfo
                };
            } catch (error: any) {
                if (error.response?.data?.error === 'Facebook Integration Required') {
                    return { isConnected: false };
                }
                throw error;
            }
        },
        enabled: !!user?.facebookAccessToken,
        retry: false
    });

    useEffect(() => {
        if (statusError) {
            console.error('Error fetching Facebook status:', statusError);
            toast.error((statusError as any).response?.data?.message || 'Failed to fetch Facebook status');
        }
        if (pageError) {
            console.error('Error fetching pages:', pageError);
            const error = pageError as any;
            if (error.response?.data?.error?.code === 4) {
                toast.error('Facebook API rate limit reached. Please try again in a few minutes.');
            } else {
                toast.error(error.response?.data?.message || 'Failed to fetch Pages');
            }
        }
    }, [statusError, pageError]);

    const handleConnect = async () => {
        try {
            setErrorMessage(null);
            const response = await connectToFacebook();
            if (response) {
                const currentSession = {
                    timestamp: Date.now(),
                    returnUrl: window.location.pathname
                };
                sessionStorage.setItem('facebookOAuthState', JSON.stringify(currentSession));
                
                window.location.href = response;
            }
        } catch (error: any) {
            console.error('Facebook connection error:', error);
            setErrorMessage(error.response?.data?.message || 'Failed to connect to Facebook');
            toast.error(error.response?.data?.message || 'Failed to connect to Facebook');
        }
    };

    const { data: campaigns, isLoading: isCampaignsLoading } = useQuery<Campaign[]>({
        queryKey: ['facebook-campaigns'],
        queryFn: getCampaigns,
        enabled: !!facebookStatus?.isConnected
    });

    

    const handleCreatePost = async () => {
        if (!selectedPage) {
            toast.error('Please select a page first');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('message', createPostData.message);
            if (createPostData.link) formData.append('link', createPostData.link);
            if (createPostData.image) formData.append('image', createPostData.image);
            if (createPostData.video) formData.append('video', createPostData.video);

            await axiosInstance.post(`/api/facebook/pages/${selectedPage.id}/posts`, formData);

            toast.success('Post created successfully');
            setIsCreatingPost(false);
            setCreatePostData({ message: '', link: '' });
            queryClient.invalidateQueries({ queryKey: ['facebook-pages'] });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create post');
        }
    };

    const handleCreatePage = async () => {
        try {
            await createPage(newPageData);
            toast.success('Page created successfully');
            setIsCreatingPage(false);
            setNewPageData({ name: '', category: '' });
            queryClient.invalidateQueries({ queryKey: ['facebook-pages'] });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create page');
        }
    };

    if (isStatusLoading || isCampaignsLoading || isPagesLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user?.facebookAccessToken) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">Facebook Integration</h1>
                        
                        {successMessage && (
                            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-green-800">{successMessage}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {errorMessage && (
                            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="text-center py-12">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">
                                Connect Your Facebook Account
                            </h2>
                            <p className="text-gray-600 mb-8">
                                To use Facebook features, you need to connect your Facebook account first.
                            </p>
                            <button
                                onClick={handleConnect}
                                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Connect Facebook Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Facebook Dashboard</h1>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setIsCreatingPage(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <FaPlus className="mr-2" />
                                Create Page
                            </button>
                            <button
                                onClick={() => setIsCreatingPost(true)}
                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
                            >
                                <FaPlus className="mr-2" />
                                Create Post
                            </button>
                        </div>
                    </div>

                    {/* Business Info Section */}
                    {facebookStatus?.businessInfo && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
                            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                                <div className="px-4 py-5 sm:px-6">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        {facebookStatus.businessInfo.name}
                                    </h3>
                                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                        Business ID: {facebookStatus.businessInfo.businessId}
                                    </p>
                                </div>
                                <div className="border-t border-gray-200">
                                    <dl>
                                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                {new Date(facebookStatus.businessInfo.lastUpdated).toLocaleString()}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ad Accounts Section */}
                    {facebookStatus?.businessInfo?.adAccounts?.data && facebookStatus.businessInfo.adAccounts.data.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ad Accounts</h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {facebookStatus.businessInfo.adAccounts.data.map((account) => (
                                    <div key={account.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                                        <div className="px-4 py-5 sm:px-6">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                                {account.name}
                                            </h3>
                                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                                Account ID: {account.account_id}
                                            </p>
                                        </div>
                                        <div className="border-t border-gray-200">
                                            <dl>
                                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                        {account.account_status === 1 ? (
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </dd>
                                                </div>
                                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                                    <dt className="text-sm font-medium text-gray-500">Currency</dt>
                                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                        {account.currency}
                                                    </dd>
                                                </div>
                                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                                    <dt className="text-sm font-medium text-gray-500">Timezone</dt>
                                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                        {account.timezone_name}
                                                    </dd>
                                                </div>
                                                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                                    <dt className="text-sm font-medium text-gray-500">Balance</dt>
                                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                        {account.currency} {account.balance}
                                                    </dd>
                                                </div>
                                                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                                    <dt className="text-sm font-medium text-gray-500">Amount Spent</dt>
                                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                        {account.currency} {account.amount_spent}
                                                    </dd>
                                                </div>
                                                {account.business && (
                                                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                                        <dt className="text-sm font-medium text-gray-500">Business</dt>
                                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                                            {account.business.name} ({account.business.id})
                                                        </dd>
                                                    </div>
                                                )}
                                            </dl>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Success and Error Messages */}
                    {successMessage && (
                        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800">{successMessage}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-blue-50 p-4 rounded-md">
                            <h3 className="text-sm font-medium text-blue-500">Ad Account ID</h3>
                            <p className="mt-1 text-lg font-semibold text-blue-900">
                                {facebookStatus?.businessInfo?.adAccounts?.data[0]?.id || 'Not set'}
                            </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-md">
                            <h3 className="text-sm font-medium text-purple-500">Business ID</h3>
                            <p className="mt-1 text-lg font-semibold text-purple-900">
                                {facebookStatus?.businessInfo?.businessId || 'Not set'}
                            </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-md">
                            <h3 className="text-sm font-medium text-green-500">Connected Pages</h3>
                            <p className="mt-1 text-lg font-semibold text-green-900">
                                {pages?.length || 0} pages
                            </p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-md">
                            <h3 className="text-sm font-medium text-yellow-500">Active Campaigns</h3>
                            <p className="mt-1 text-lg font-semibold text-yellow-900">
                                {campaigns?.filter(c => c.status === 'ACTIVE').length || 0} campaigns
                            </p>
                        </div>
                    </div>

                    {/* Create Page Modal */}
                    {isCreatingPage && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                <h2 className="text-xl font-bold mb-4">Create New Page</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Page Name</label>
                                        <input
                                            type="text"
                                            value={newPageData.name}
                                            onChange={(e) => setNewPageData({ ...newPageData, name: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Category</label>
                                        <input
                                            type="text"
                                            value={newPageData.category}
                                            onChange={(e) => setNewPageData({ ...newPageData, category: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-4">
                                        <button
                                            onClick={() => setIsCreatingPage(false)}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreatePage}
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                        >
                                            Create
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Create Post Modal */}
                    {isCreatingPost && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                <h2 className="text-xl font-bold mb-4">Create New Post</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Select Page</label>
                                        <select
                                            value={selectedPage?.id || ''}
                                            onChange={(e) => setSelectedPage(pages?.find(p => p.id === e.target.value) || null)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="">Select a page</option>
                                            {pages?.map(page => (
                                                <option key={page.id} value={page.id}>{page.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Message</label>
                                        <textarea
                                            value={createPostData.message}
                                            onChange={(e) => setCreatePostData({ ...createPostData, message: e.target.value })}
                                            rows={4}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Link (optional)</label>
                                        <input
                                            type="url"
                                            value={createPostData.link}
                                            onChange={(e) => setCreatePostData({ ...createPostData, link: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex space-x-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Image</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setCreatePostData({ ...createPostData, image: e.target.files?.[0] })}
                                                className="mt-1 block w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Video</label>
                                            <input
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => setCreatePostData({ ...createPostData, video: e.target.files?.[0] })}
                                                className="mt-1 block w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-4">
                                        <button
                                            onClick={() => setIsCreatingPost(false)}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreatePost}
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                        >
                                            Post
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Campaigns Section */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Campaigns</h2>
                            <button
                                onClick={() => navigate('/facebook/campaigns/new')}
                                className="text-blue-600 hover:text-blue-700 flex items-center"
                            >
                                <FaPlus className="mr-1" />
                                New Campaign
                            </button>
                        </div>
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul className="divide-y divide-gray-200">
                                {campaigns?.map((campaign) => (
                                    <li key={campaign.id}>
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-blue-600 truncate">
                                                    {campaign.name}
                                                </p>
                                                <div className="ml-2 flex-shrink-0 flex">
                                                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        campaign.status === 'ACTIVE' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {campaign.status}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2 sm:flex sm:justify-between">
                                                <div className="sm:flex">
                                                    <p className="flex items-center text-sm text-gray-500">
                                                        {campaign.objective}
                                                    </p>
                                                </div>
                                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                    <p>
                                                        Created {new Date(campaign.created_time).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Pages Section */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pages</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {isPagesLoading ? (
                                <div className="col-span-full text-center py-8">
                                    <div className="animate-pulse">
                                        <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
                                        <div className="h-32 bg-gray-200 rounded"></div>
                                    </div>
                                </div>
                            ) : Array.isArray(pages) && pages.length > 0 ? (
                                pages.map((page) => (
                                    <div key={page.id} className="bg-white shadow rounded-lg overflow-hidden">
                                        <div className="p-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-medium text-gray-900">{page.name}</h3>
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {page.category}
                                                </span>
                                            </div>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    Tasks: {page.tasks.join(', ')}
                                                </p>
                                            </div>
                                            <div className="mt-4 flex space-x-2">
                                                <button
                                                    onClick={() => navigate(`/facebook/pages/${page.id}`)}
                                                    className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100"
                                                >
                                                    <FaChartLine className="inline mr-1" />
                                                    Insights
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedPage(page);
                                                        setIsCreatingPost(true);
                                                    }}
                                                    className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-green-100"
                                                >
                                                    <FaEdit className="inline mr-1" />
                                                    Post
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-8">
                                    <p className="text-gray-500">No pages found. Create a new page to get started.</p>
                                    <button
                                        onClick={() => setIsCreatingPage(true)}
                                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center mx-auto"
                                    >
                                        <FaPlus className="mr-2" />
                                        Create Page
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Facebook; 