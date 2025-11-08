/**
 * Government Scheme Service
 * Handles government health schemes and benefits
 */

import apiService from './ApiService';

export interface GovernmentScheme {
  _id?: string;
  name: string;
  nameHindi?: string;
  description: string;
  descriptionHindi?: string;
  category: 'health_insurance' | 'maternity' | 'child_health' | 'senior_citizen' | 'disability' | 'nutrition' | 'general';
  provider: 'central' | 'state' | 'combined';
  state?: string;
  eligibility: {
    ageMin?: number;
    ageMax?: number;
    gender?: 'male' | 'female' | 'other' | 'all';
    incomeLimit?: number;
    bplCardRequired?: boolean;
    specificConditions?: string[];
  };
  benefits: string[];
  benefitsHindi?: string[];
  coverageAmount?: number;
  documents: {
    required: string[];
    optional?: string[];
  };
  applicationProcess: {
    online?: string;
    offline?: string;
    steps?: string[];
  };
  contactInfo?: {
    helpline?: string;
    email?: string;
    website?: string;
  };
  isActive?: boolean;
  tags?: string[];
  createdAt?: string;
}

export interface SchemeBookmark {
  _id?: string;
  scheme: string | GovernmentScheme;
  notes?: string;
  createdAt?: string;
}

class GovernmentSchemeService {
  /**
   * Get all schemes
   */
  async getSchemes(params?: {
    category?: string;
    provider?: string;
    state?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const response = await apiService.get<{
        schemes: GovernmentScheme[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>('/schemes', params as any);
      return response;
    } catch (error) {
      console.error('Get schemes failed:', error);
      throw error;
    }
  }

  /**
   * Get scheme by ID
   */
  async getSchemeById(id: string) {
    try {
      const response = await apiService.get<{ scheme: GovernmentScheme }>(
        `/schemes/${id}`
      );
      return response;
    } catch (error) {
      console.error('Get scheme failed:', error);
      throw error;
    }
  }

  /**
   * Get eligible schemes for user
   */
  async getEligibleSchemes(params?: {
    age?: number;
    gender?: string;
    income?: number;
    state?: string;
  }) {
    try {
      const response = await apiService.get<{
        schemes: GovernmentScheme[];
        count: number;
      }>('/schemes/eligible', params as any);
      return response;
    } catch (error) {
      console.error('Get eligible schemes failed:', error);
      throw error;
    }
  }

  /**
   * Get user's bookmarked schemes
   */
  async getBookmarks() {
    try {
      const response = await apiService.get<{
        bookmarks: SchemeBookmark[];
      }>('/schemes/bookmarks');
      return response;
    } catch (error) {
      console.error('Get bookmarks failed:', error);
      throw error;
    }
  }

  /**
   * Add scheme to bookmarks
   */
  async addBookmark(schemeId: string, notes?: string) {
    try {
      const response = await apiService.post<{ bookmark: SchemeBookmark }>(
        '/schemes/bookmarks',
        { schemeId, notes }
      );
      return response;
    } catch (error) {
      console.error('Add bookmark failed:', error);
      throw error;
    }
  }

  /**
   * Remove scheme from bookmarks
   */
  async removeBookmark(bookmarkId: string) {
    try {
      const response = await apiService.delete(`/schemes/bookmarks/${bookmarkId}`);
      return response;
    } catch (error) {
      console.error('Remove bookmark failed:', error);
      throw error;
    }
  }

  /**
   * Update bookmark notes
   */
  async updateBookmarkNotes(bookmarkId: string, notes: string) {
    try {
      const response = await apiService.put<{ bookmark: SchemeBookmark }>(
        `/schemes/bookmarks/${bookmarkId}`,
        { notes }
      );
      return response;
    } catch (error) {
      console.error('Update bookmark notes failed:', error);
      throw error;
    }
  }

  /**
   * Search schemes by category
   */
  async getSchemesByCategory(category: string) {
    try {
      const response = await this.getSchemes({ category, limit: 50 });
      return response;
    } catch (error) {
      console.error('Get schemes by category failed:', error);
      throw error;
    }
  }

  /**
   * Search schemes by state
   */
  async getSchemesByState(state: string) {
    try {
      const response = await this.getSchemes({ state, limit: 50 });
      return response;
    } catch (error) {
      console.error('Get schemes by state failed:', error);
      throw error;
    }
  }

  /**
   * Get central government schemes
   */
  async getCentralSchemes() {
    try {
      const response = await this.getSchemes({ provider: 'central', limit: 50 });
      return response;
    } catch (error) {
      console.error('Get central schemes failed:', error);
      throw error;
    }
  }

  /**
   * Get state government schemes
   */
  async getStateSchemes(state?: string) {
    try {
      const response = await this.getSchemes({
        provider: 'state',
        state,
        limit: 50,
      });
      return response;
    } catch (error) {
      console.error('Get state schemes failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const governmentSchemeService = new GovernmentSchemeService();

export default governmentSchemeService;
