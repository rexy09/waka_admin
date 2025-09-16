export interface UserFilterParameters {
  role?: string;
  isVerified?: boolean | "both";
  status?: string;
  country?: string;
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  isProduction?: boolean | "both";
  userType?: string;
}

export interface UserFilterOptions {
  roles: string[];
  statuses: string[];
  countries: { name: string; code: string }[];
  userTypes: string[];
}