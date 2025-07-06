export interface Provider {
  business_name: string | null;
  username: string;
  category: string | null;
  profile_image_url: string | null;
  bio: string | null;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface GenerateImageRequest {
  providerId: string;
  format?: 'story' | 'square';
}

export interface GenerateImageResponse {
  image: string;
  format: string;
  provider: {
    business_name: string | null;
    username: string;
  };
}