export interface UserStatistics {
  totalJobsPosted: number;
  activeJobPosts: number;
  profileViews: number;
  totalHiredJobs: number;
  totalUsers: number;
  verifiedUsers: number;
  activeUsers: number;
}

export interface StatisticCard {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export interface DashboardAnalytics {
  jobPostingTrends: ChartData;
}