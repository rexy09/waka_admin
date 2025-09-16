export interface UserStatistics {
  totalJobsPosted: number;
  totalJobsApplied: number;
  activeJobPosts: number;
  totalViews: number;
  totalApplications: number;
  hiredCandidates: number;
  profileViews: number;
  responseRate: number;
  totalUsers: number;
  verifiedUsers: number;
  newUsersThisMonth: number;
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
  applicationsByMonth: ChartData;
  topPerformingJobs: {
    title: string;
    applications: number;
    views: number;
  }[];
}