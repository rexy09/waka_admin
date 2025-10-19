export interface IBanner {
  id: string;
  title: string;
  banner_type: string;
  image: string | null;
  youtube_url: string | null;
  cta_text: string;
  cta_link: string;
  audience: string;
  is_active: boolean;
  is_visible: boolean;
  priority: number;
  created_at: string;
}

export interface IBannerResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IBanner[];
}

export interface IBannerDetails {
  id: string;
  title: string;
  description: string;
  banner_type:
    | string
    | "image"
    | "youtube"
    | "video"
    | "info"
    | "education"
    | "news";
  image: string | null;
  video: string | null;
  youtube_url: string;
  cta_text: string;
  cta_link: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  is_visible: boolean;
  audience: string | "all";
  location: string | null;
  is_sponsored: boolean;
  sponsor_name: string | null;
  sponsor_contact: string | null;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface BannerFom {
  title: string;
  description: string;
  banner_type: string;
  cta_text: string;
  cta_link: string;
  audience: string;
  is_active: boolean;
  priority: number;
  start_date: string; // ISO 8601 format
  end_date: string; // ISO 8601 format
  image?: File | string; // File for upload, string for URL
  youtube_url?: string; // YouTube URL for youtube banner type
}
