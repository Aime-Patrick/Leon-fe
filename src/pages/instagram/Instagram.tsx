import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { instagramApi, type InstagramInsights, type InstagramMedia, type InstagramProfile} from '../../api/instagramApi';
import { toast } from 'react-hot-toast';

const Instagram: React.FC = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<InstagramProfile | null>(null);
    const [media, setMedia] = useState<InstagramMedia[]>([]);
    const [insights, setInsights] = useState<InstagramInsights | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileData, mediaData, insightsData] = await Promise.all([
                    instagramApi.getProfile(),
                    instagramApi.getMedia(),
                    instagramApi.getInsights()
                ]);
                setProfile(profileData);
                setMedia(mediaData);
                setInsights(insightsData);
            } catch (error: any) {
                if (error.response?.status === 400) {
                    // Instagram not connected
                    setError('Please connect your Instagram account first');
                } else {
                    setError('Failed to load Instagram data');
                    toast.error('Failed to load Instagram data');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleConnect = async () => {
        try {
            const { authUrl } = await instagramApi.initiateAuth();
            window.location.href = authUrl;
        } catch (error) {
            toast.error('Failed to initiate Instagram connection');
            console.error('Instagram auth error:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold mb-4">Instagram Integration</h1>
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={handleConnect}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                        Connect Instagram
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Instagram Dashboard</h1>
                <button
                    onClick={() => navigate('/instagram/media/new')}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                    Create Post
                </button>
            </div>

            {/* Profile Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">Profile</h2>
                {profile && (
                    <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-2xl">📸</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">@{profile.username}</h3>
                            <p className="text-gray-600">Account Type: {profile.account_type}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Insights Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4">Insights</h2>
                {insights && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded">
                            <h3 className="font-semibold">Engagement</h3>
                            <p className="text-2xl">{insights.engagement}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                            <h3 className="font-semibold">Impressions</h3>
                            <p className="text-2xl">{insights.impressions}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                            <h3 className="font-semibold">Reach</h3>
                            <p className="text-2xl">{insights.reach}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                            <h3 className="font-semibold">Saved</h3>
                            <p className="text-2xl">{insights.saved}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                            <h3 className="font-semibold">Profile Views</h3>
                            <p className="text-2xl">{insights.profile_views}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                            <h3 className="font-semibold">Followers</h3>
                            <p className="text-2xl">{insights.follower_count}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Media Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Recent Posts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {media.map((item) => (
                        <div key={item.id} className="border rounded-lg overflow-hidden">
                            {item.media_type === 'IMAGE' && (
                                <img
                                    src={item.media_url}
                                    alt={item.caption || 'Instagram post'}
                                    className="w-full h-48 object-cover"
                                />
                            )}
                            {item.media_type === 'VIDEO' && (
                                <video
                                    src={item.media_url}
                                    className="w-full h-48 object-cover"
                                    controls
                                />
                            )}
                            <div className="p-4">
                                <p className="text-sm text-gray-500 mb-2">
                                    {new Date(item.timestamp).toLocaleDateString()}
                                </p>
                                {item.caption && (
                                    <p className="text-gray-700 line-clamp-2">{item.caption}</p>
                                )}
                                <a
                                    href={item.permalink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-600 mt-2 inline-block"
                                >
                                    View on Instagram
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Instagram; 