import { useState, useEffect } from "react";
import { FaTiktok, FaSearch, FaUser, FaVideo, FaHeart, FaComment, FaShare } from "react-icons/fa";
import axiosInstance from "../../utils/axios";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

interface ErrorResponse {
  error: string;
  details?: string;
}

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

const TikTok = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAuth = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/api/auth/tiktok/auth");

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
              <span>
                <FaTiktok className="mr-2" />
                {isTokenExpired ? "Reconnect TikTok" : "Connect TikTok"}
              </span>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              placeholder="Search TikTok videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  <img
                    src={video.video.cover}
                    alt={video.description}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white text-sm truncate">{video.description}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <img
                      src={video.author.avatarThumb}
                      alt={video.author.nickname}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium">{video.author.nickname}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-sm">
                    <div className="flex items-center">
                      <FaHeart className="mr-1" />
                      {video.statistics.diggCount}
                    </div>
                    <div className="flex items-center">
                      <FaComment className="mr-1" />
                      {video.statistics.commentCount}
                    </div>
                    <div className="flex items-center">
                      <FaShare className="mr-1" />
                      {video.statistics.shareCount}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TikTok; 