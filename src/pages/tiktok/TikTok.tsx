import { useState, useEffect } from "react";
import { FaTiktok, } from "react-icons/fa";
import axiosInstance from "../../utils/axios";
import { toast } from "react-hot-toast";
import { useLocation, useNavigate } from 'react-router-dom';
import { useTikTokAccount } from '../../hooks/useTikTokAccount';
import { useTikTokVideos } from '../../hooks/useTikTokVideos';
import type { CreateVideoData } from '../../api/tiktokApi';
import { FiUpload, FiRefreshCw } from 'react-icons/fi';

// interface ErrorResponse {
//   error: string;
//   details?: string;
// }

interface TikTokVideo {
  id: string;
  description: string;
  createTime: number;
  author: {
    id: string;
    uniqueId: string;
    nickname: string;
    avatarThumb: string;
  };
  statistics: {
    playCount: number;
    diggCount: number;
    commentCount: number;
    shareCount: number;
  };
  video: {
    cover: string;
    playAddr: string;
  };
}

// interface TikTokStatus {
//     isConnected: boolean;
//     accountInfo?: {
//         id: string;
//         username: string;
//         displayName: string;
//         avatarUrl: string;
//         followersCount: number;
//         followingCount: number;
//         likesCount: number;
//         videoCount: number;
//     };
// }

const TikTok = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [videos, setVideos] = useState<TikTokVideo[]>([]);
  // const [searchQuery, setSearchQuery] = useState("");
  // const [user, setUser] = useState<any>(null);
  const location = useLocation();
  // const navigate = useNavigate();
  // const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreatingVideo, setIsCreatingVideo] = useState(false);
  const [createVideoData, setCreateVideoData] = useState<CreateVideoData>({
    description: '',
    video: null as any,
    privacyLevel: 'PUBLIC',
  });

  const {
    accountInfo,
    isLoading: isAccountLoading,
    isConnected,
    isTokenExpired,
    connect,
    isConnecting,
    refetch: refetchAccount,
  } = useTikTokAccount();

  const {
    videos: tiktokVideos,
    isLoading: isVideosLoading,
    uploadVideo,
    isUploading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTikTokVideos();

  const handleAuth = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/api/tiktok/auth/login");

      if (!response.data.authUrl) {
        throw new Error("No auth URL received from server");
      }

      // Store current URL to return to after auth
      localStorage.setItem("tiktok_redirect_url", window.location.href);

      // Redirect to TikTok auth page
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error("Error initiating auth:", error);
      toast.error("Failed to connect to TikTok. Please try again.");
      setIsLoading(false);
    }
  };

  // Check TikTok authentication status on mount
  useEffect(() => {
    const checkTikTokAuth = async () => {
      try {
        const response = await axiosInstance.get("/api/auth/tiktok/verify");
        setIsAuthenticated(response.data.success);
      } catch (error) {
        console.error("Invalid TikTok token:", error);
        localStorage.removeItem("tiktok_access_token");
        setIsAuthenticated(false);
        toast.error("TikTok session expired. Please reconnect your account.");
      }
    };

    checkTikTokAuth();
  }, []);

  // useEffect(() => {
  //   const storedUser = localStorage.getItem('user');
  //   // if (storedUser) {
  //   //   setUser(JSON.parse(storedUser));
  //   // }

  //   // if (location.state?.message) {
  //   //   setSuccessMessage(location.state.message);
  //   //   const timer = setTimeout(() => {
  //   //     setSuccessMessage(null);
  //   //   }, 5000);
  //   //   return () => clearTimeout(timer);
  //   // }
  // }, [location]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const message = params.get('message');
    const error = params.get('error');

    if (message) {
      toast.success(message);
      refetchAccount();
    } else if (error) {
      toast.error(error);
    }
  }, [refetchAccount]);

  const handleConnect = async () => {
    try {
      // setErrorMessage(null);
      const response = await axiosInstance.get('/api/tiktok/auth/login');
      if (response.data) {
        const currentSession = {
          timestamp: Date.now(),
          returnUrl: window.location.pathname
        };
        sessionStorage.setItem('tiktokOAuthState', JSON.stringify(currentSession));
        
        window.location.href = response.data;
      }
    } catch (error: any) {
      console.error('TikTok connection error:', error);
      // setErrorMessage(error.response?.data?.message || 'Failed to connect to TikTok');
      toast.error(error.response?.data?.message || 'Failed to connect to TikTok');
    }
  };

  const handleVideoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createVideoData.video) {
        toast.error('Please select a video to upload');
        return;
    }

    try {
        await uploadVideo(createVideoData);
        setIsCreatingVideo(false);
        setCreateVideoData({
            description: '',
            video: null as any,
            privacyLevel: 'PUBLIC',
        });
    } catch (error) {
        console.error('Failed to upload video:', error);
    }
  };

  if (!isAuthenticated) {
    let isTokenExpired = false;
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <div className="text-center flex flex-col justify-center items-center w-full">
          <h2 className="text-2xl font-bold mb-4">Connect to TikTok</h2>
          <p className="text-gray-600 mb-6">
            {isTokenExpired
              ? "Your TikTok connection has expired. Please reconnect to continue."
              : "To use TikTok features, you need to connect your TikTok account."}
          </p>
          <button
            onClick={handleAuth}
            className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md flex items-center"
          >
            {isLoading ? (
              "Processing..."
            ) : (
              <span className="flex items-center justify-center">
                <FaTiktok className="mr-2" />
                {isTokenExpired ? "Reconnect TikTok" : "Connect TikTok"}
              </span>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (isAccountLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">Connect Your TikTok Account</h1>
          <p className="text-gray-600 mb-8">
            Connect your TikTok account to start managing your videos and track your performance.
          </p>
          <button
            onClick={() => connect()}
            disabled={isConnecting}
            className="bg-[#fe2c55] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#e62a4d] transition-colors disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Connect TikTok Account'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Account Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <img
              src={accountInfo?.avatarUrl}
              alt={accountInfo?.username}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h2 className="text-2xl font-bold">{accountInfo?.displayName}</h2>
              <p className="text-gray-600">@{accountInfo?.username}</p>
            </div>
          </div>
          <button
            onClick={() => refetchAccount()}
            className="text-gray-600 hover:text-gray-800"
          >
            <FiRefreshCw className="w-6 h-6" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{accountInfo?.followersCount}</p>
            <p className="text-gray-600">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{accountInfo?.followingCount}</p>
            <p className="text-gray-600">Following</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{accountInfo?.likesCount}</p>
            <p className="text-gray-600">Likes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{accountInfo?.videoCount}</p>
            <p className="text-gray-600">Videos</p>
          </div>
        </div>
      </div>

      {/* Video Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Videos</h2>
          <button
            onClick={() => setIsCreatingVideo(true)}
            className="bg-[#fe2c55] text-white px-4 py-2 rounded-full font-semibold hover:bg-[#e62a4d] transition-colors"
          >
            <FiUpload className="inline-block mr-2" />
            Upload Video
          </button>
        </div>

        {isVideosLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : tiktokVideos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No videos uploaded yet</p>
            <button
              onClick={() => setIsCreatingVideo(true)}
              className="bg-[#fe2c55] text-white px-4 py-2 rounded-full font-semibold hover:bg-[#e62a4d] transition-colors"
            >
              Upload Your First Video
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiktokVideos.map((video: any) => (
              <div key={video.id} className="bg-gray-50 rounded-lg overflow-hidden">
                <div className="relative aspect-[9/16]">
                  <img
                    src={video.coverImageUrl}
                    alt={video.description}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white text-sm line-clamp-2">{video.description}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-2 text-center text-sm text-gray-600">
                    <div>
                      <p className="font-semibold">{video.viewCount}</p>
                      <p>Views</p>
                    </div>
                    <div>
                      <p className="font-semibold">{video.likeCount}</p>
                      <p>Likes</p>
                    </div>
                    <div>
                      <p className="font-semibold">{video.commentCount}</p>
                      <p>Comments</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasNextPage && (
          <div className="text-center mt-8">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {isFetchingNextPage ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>

      {/* Upload Video Modal */}
      {isCreatingVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-2xl font-bold mb-4">Upload Video</h3>
            <form onSubmit={handleVideoUpload}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Description
                </label>
                <textarea
                  value={createVideoData.description}
                  onChange={(e) =>
                    setCreateVideoData({
                      ...createVideoData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe2c55]"
                  rows={3}
                  maxLength={2200}
                  placeholder="Write a description for your video..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Video File
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        setCreateVideoData({
                            ...createVideoData,
                            video: file,
                        });
                    }
                  }}
                  className="w-full"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Cover Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setCreateVideoData({
                      ...createVideoData,
                      coverImage: e.target.files?.[0],
                    })
                  }
                  className="w-full"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Privacy Level
                </label>
                <select
                  value={createVideoData.privacyLevel}
                  onChange={(e) =>
                    setCreateVideoData({
                      ...createVideoData,
                      privacyLevel: e.target.value as 'PUBLIC' | 'FRIENDS' | 'PRIVATE',
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fe2c55]"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="FRIENDS">Friends</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsCreatingVideo(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="bg-[#fe2c55] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#e62a4d] transition-colors disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Upload Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TikTok; 