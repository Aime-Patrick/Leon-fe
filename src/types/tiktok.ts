export interface TikTokVideo {
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

export interface TikTokResponse {
  videos: TikTokVideo[];
  cursor?: string;
  hasMore: boolean;
} 