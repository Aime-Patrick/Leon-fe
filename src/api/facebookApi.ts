import axiosInstance from "../utils/axios";

// Types
export interface Campaign {
    id: string;
    name: string;
    status: string;
    objective: string;
    created_time: string;
}

export interface AdSet {
    id: string;
    name: string;
    campaign_id: string;
    status: string;
    daily_budget: number;
    lifetime_budget: number;
    start_time: string;
    end_time: string;
}

export interface Ad {
    id: string;
    name: string;
    adset_id: string;
    status: string;
    creative: {
        id: string;
        name: string;
        object_story_spec: any;
    };
}

export interface Page {
    id: string;
    name: string;
    access_token: string;
    category: string;
    tasks: string[];
}

export interface BusinessInfo {
    businessId: string;
    name: string;
    adAccounts: {
        data: Array<{
            id: string;
            name: string;
            account_status: number;
            currency: string;
            timezone_name: string;
            account_id: string;
            balance: string;
            spend_cap: string;
            amount_spent: string;
            business?: {
                id: string;
                name: string;
            };
        }>;
    };
    lastUpdated: string;
}

// API Functions
export const connectToFacebook = async (): Promise<string> => {
    const response = await axiosInstance.get('/api/facebook/auth/login');
    return response.data;
};

export const verifyPermissions = async () => {
    const response = await axiosInstance.get('/api/facebook/verify-permissions');
    return response.data;
};

export const getBusinessInfo = async (): Promise<BusinessInfo> => {
    try {
        const response = await axiosInstance.get('/api/facebook/business-info');
    return response.data;
    } catch (error) {
        throw error
    }
};

export const getCampaigns = async (): Promise<Campaign[]> => {
    const response = await axiosInstance.get('/api/facebook/campaigns');
    return response.data;
};

export const createCampaign = async (campaignData: {
    name: string;
    objective: string;
    status: string;
}): Promise<Campaign> => {
    const response = await axiosInstance.post('/api/facebook/campaigns', campaignData);
    return response.data;
};

export const getAdSets = async (campaignId: string): Promise<AdSet[]> => {
    const response = await axiosInstance.get(`/api/facebook/campaigns/${campaignId}/ad-sets`);
    return response.data;
};

export const createAdSet = async (campaignId: string, adSetData: {
    name: string;
    daily_budget: number;
    start_time: string;
    end_time: string;
    targeting: any;
}): Promise<AdSet> => {
    const response = await axiosInstance.post(`/api/facebook/campaigns/${campaignId}/ad-sets`, adSetData);
    return response.data;
};

export const getAds = async (adSetId: string): Promise<Ad[]> => {
    const response = await axiosInstance.get(`/api/facebook/ad-sets/${adSetId}/ads`);
    return response.data;
};

export const createAd = async (adSetId: string, adData: {
    name: string;
    creative: {
        object_story_spec: any;
    };
}): Promise<Ad> => {
    const response = await axiosInstance.post(`/api/facebook/ad-sets/${adSetId}/ads`, adData);
    return response.data;
};

export const getPages = async (): Promise<Page[]> => {
    try {
        const response = await axiosInstance.get('/api/facebook/pages');
    return response.data;
    } catch (error) {
        throw error
    }
};

export const createPage = async (pageData: {
    name: string;
    category: string;
}): Promise<Page> => {
    const response = await axiosInstance.post('/api/facebook/pages', pageData);
    return response.data;
};

export const getInsights = async (params: {
    time_range?: { since: string; until: string };
    metrics?: string[];
}): Promise<any> => {
    const response = await axiosInstance.get('/api/facebook/insights', { params });
    return response.data;
};