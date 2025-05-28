import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { instagramApi } from '../../api/instagramApi';
import { toast } from 'react-hot-toast';

const CreatePost: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        image_url: '',
        video_url: '',
        caption: '',
        media_type: 'IMAGE' as 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REEL' | 'STORY'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await instagramApi.createPost(formData);
            toast.success('Post created successfully');
            navigate('/instagram');
        } catch (error) {
            toast.error('Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Create Instagram Post</h1>
                    <button
                        onClick={() => navigate('/instagram')}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Media Type
                        </label>
                        <select
                            name="media_type"
                            value={formData.media_type}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="IMAGE">Image</option>
                            <option value="VIDEO">Video</option>
                            <option value="CAROUSEL_ALBUM">Carousel Album</option>
                            <option value="REEL">Reel</option>
                            <option value="STORY">Story</option>
                        </select>
                    </div>

                    {formData.media_type === 'IMAGE' && (
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Image URL
                            </label>
                            <input
                                type="url"
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://example.com/image.jpg"
                                required
                            />
                        </div>
                    )}

                    {formData.media_type === 'VIDEO' && (
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Video URL
                            </label>
                            <input
                                type="url"
                                name="video_url"
                                value={formData.video_url}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://example.com/video.mp4"
                                required
                            />
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Caption
                        </label>
                        <textarea
                            name="caption"
                            value={formData.caption}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            placeholder="Write your caption here..."
                            maxLength={2200}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            {formData.caption.length}/2200 characters
                        </p>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/instagram')}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost; 