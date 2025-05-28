import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axios';
import type { CampaignObjective, SpecialAdCategory } from '../../api/facebookApi';

const campaignObjectives: CampaignObjective[] = [
    'OUTCOME_TRAFFIC',
    'OUTCOME_AWARENESS',
    'OUTCOME_ENGAGEMENT',
    'OUTCOME_LEADS',
    'OUTCOME_SALES',
    'OUTCOME_APP_PROMOTION',
    'OUTCOME_MESSAGES',
    'OUTCOME_REACH',
    'OUTCOME_VIDEO_VIEWS',
    'OUTCOME_STORE_VISITS'
];

const specialAdCategories: SpecialAdCategory[] = [
    'HOUSING',
    'EMPLOYMENT',
    'CREDIT',
    'ISSUES_ELECTIONS_POLITICS'
];

const CreateCampaign = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        objective: '' as CampaignObjective,
        status: 'PAUSED' as 'ACTIVE' | 'PAUSED' | 'DELETED',
        special_ad_categories: [] as SpecialAdCategory[],
        buying_type: 'AUCTION' as 'AUCTION' | 'RESERVED',
        campaign_optimization_type: 'NONE' as 'NONE' | 'ICO_ONLY'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await axiosInstance.post('/api/facebook/campaigns', formData);
            toast.success('Campaign created successfully');
            navigate('/facebook');
        } catch (error: any) {
            console.error('Error creating campaign:', error);
            toast.error(error.response?.data?.message || 'Failed to create campaign');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSpecialAdCategoriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            special_ad_categories: checked
                ? [...prev.special_ad_categories, value as SpecialAdCategory]
                : prev.special_ad_categories.filter(cat => cat !== value)
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
                        <button
                            onClick={() => navigate('/facebook')}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            Back to Facebook
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Campaign Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="objective" className="block text-sm font-medium text-gray-700">
                                Campaign Objective
                            </label>
                            <select
                                id="objective"
                                name="objective"
                                required
                                value={formData.objective}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Select an objective</option>
                                {campaignObjectives.map(objective => (
                                    <option key={objective} value={objective}>
                                        {objective.replace('OUTCOME_', '').replace(/_/g, ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="PAUSED">Paused</option>
                                <option value="ACTIVE">Active</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="buying_type" className="block text-sm font-medium text-gray-700">
                                Buying Type
                            </label>
                            <select
                                id="buying_type"
                                name="buying_type"
                                value={formData.buying_type}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="AUCTION">Auction</option>
                                <option value="RESERVED">Reserved</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Special Ad Categories
                            </label>
                            <div className="space-y-2">
                                {specialAdCategories.map(category => (
                                    <div key={category} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={category}
                                            name="special_ad_categories"
                                            value={category}
                                            checked={formData.special_ad_categories.includes(category)}
                                            onChange={handleSpecialAdCategoriesChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor={category} className="ml-2 block text-sm text-gray-900">
                                            {category.replace(/_/g, ' ')}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate('/facebook')}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Creating...' : 'Create Campaign'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateCampaign; 