import { get } from '../client';

const BASE_URL = '/v1/recruiters';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  website?: string;
  description?: string;
  headquarters?: string;
  country?: string;
  industry?: string;
  size: 'STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';
  foundedYear?: number;
  linkedIn?: string;
  isVerified: boolean;
  verifiedAt?: string;
  totalJobs: number;
  activeJobs: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationRecruiter {
  id: string;
  name: string;
  title?: string;
  email: string;
  avatarUrl?: string;
  role: 'ADMIN' | 'RECRUITER' | 'VIEWER';
  isActive: boolean;
}

export interface OrganizationJob {
  id: string;
  title: string;
  location: string;
  type: string;
  experience: string;
  salary?: {
    min?: number;
    max?: number;
    currency: string;
  };
  postedAt: string;
  applicantsCount: number;
}

export interface OrganizationProfile {
  organization: Organization;
  recruiters: OrganizationRecruiter[];
  activeJobs: OrganizationJob[];
  stats: {
    totalRecruiters: number;
    activeRecruiters: number;
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
  };
}

export const organizationApi = {
  /**
   * Get organization by ID
   */
  getOrganization: async (organizationId: string) => {
    return get<Organization>(`${BASE_URL}/organizations/${organizationId}`);
  },

  /**
   * Get full organization profile (organization + recruiters + jobs)
   */
  getOrganizationProfile: async (organizationId: string) => {
    return get<OrganizationProfile>(`${BASE_URL}/organizations/${organizationId}/profile`);
  },

  /**
   * Get organization recruiters
   */
  getOrganizationRecruiters: async (organizationId: string) => {
    return get<OrganizationRecruiter[]>(`${BASE_URL}/organizations/${organizationId}/recruiters`);
  },

  /**
   * Get organization jobs
   */
  getOrganizationJobs: async (organizationId: string, params?: { limit?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    
    return get<OrganizationJob[]>(`${BASE_URL}/organizations/${organizationId}/jobs?${searchParams.toString()}`);
  },
};
