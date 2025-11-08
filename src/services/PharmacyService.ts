/**
 * Pharmacy Service
 * Handles pharmacy search and medicine orders
 */

import apiService from './ApiService';

export interface Pharmacy {
  _id: string;
  name: string;
  ownerName: string;
  licenseNumber: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  contact: {
    phone: string;
    email?: string;
    website?: string;
  };
  services: {
    homeDelivery: boolean;
    emergencyService: boolean;
    onlineOrdering: boolean;
    consultationAvailable: boolean;
  };
  operatingHours: {
    monday?: { open: string; close: string; closed?: boolean };
    tuesday?: { open: string; close: string; closed?: boolean };
    wednesday?: { open: string; close: string; closed?: boolean };
    thursday?: { open: string; close: string; closed?: boolean };
    friday?: { open: string; close: string; closed?: boolean };
    saturday?: { open: string; close: string; closed?: boolean };
    sunday?: { open: string; close: string; closed?: boolean };
  };
  rating?: number;
  totalReviews?: number;
  isVerified?: boolean;
  isActive?: boolean;
  distance?: number;
}

export interface OrderItem {
  medicineName: string;
  quantity: number;
  dosage?: string;
  prescriptionRequired?: boolean;
}

export interface PharmacyOrder {
  _id?: string;
  pharmacy: string | Pharmacy;
  items: OrderItem[];
  totalAmount?: number;
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  deliveryType: 'delivery' | 'pickup';
  prescriptionUrl?: string;
  status?: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  notes?: string;
  estimatedDeliveryTime?: string;
  createdAt?: string;
}

class PharmacyService {
  /**
   * Get nearby pharmacies
   */
  async getNearbyPharmacies(params: {
    latitude: number;
    longitude: number;
    radius?: number;
    services?: string[];
    isOpen?: boolean;
  }) {
    try {
      const response = await apiService.get<{
        pharmacies: Pharmacy[];
        count: number;
      }>('/pharmacies/nearby', params as any);
      return response;
    } catch (error) {
      console.error('Get nearby pharmacies failed:', error);
      throw error;
    }
  }

  /**
   * Search pharmacies
   */
  async searchPharmacies(params?: {
    search?: string;
    city?: string;
    services?: string[];
    page?: number;
    limit?: number;
  }) {
    try {
      const response = await apiService.get<{
        pharmacies: Pharmacy[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>('/pharmacies/search', params as any);
      return response;
    } catch (error) {
      console.error('Search pharmacies failed:', error);
      throw error;
    }
  }

  /**
   * Get pharmacy by ID
   */
  async getPharmacyById(id: string) {
    try {
      const response = await apiService.get<{ pharmacy: Pharmacy }>(
        `/pharmacies/${id}`
      );
      return response;
    } catch (error) {
      console.error('Get pharmacy failed:', error);
      throw error;
    }
  }

  /**
   * Place medicine order
   */
  async placeOrder(data: {
    pharmacy: string;
    items: OrderItem[];
    deliveryAddress?: any;
    deliveryType: 'delivery' | 'pickup';
    prescriptionImage?: string;
    notes?: string;
  }) {
    try {
      let prescriptionUrl: string | undefined;

      // Upload prescription if provided
      if (data.prescriptionImage) {
        const formData = new FormData();
        formData.append('prescription', {
          uri: data.prescriptionImage,
          type: 'image/jpeg',
          name: 'prescription.jpg',
        } as any);

        const uploadResponse = await apiService.uploadFile<{ url: string }>(
          '/pharmacies/upload-prescription',
          formData
        );
        prescriptionUrl = uploadResponse.data.url;
      }

      const orderData = {
        ...data,
        prescriptionUrl,
        prescriptionImage: undefined,
      };

      const response = await apiService.post<{ order: PharmacyOrder }>(
        '/pharmacies/orders',
        orderData
      );
      return response;
    } catch (error) {
      console.error('Place order failed:', error);
      throw error;
    }
  }

  /**
   * Get user's orders
   */
  async getOrders(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const response = await apiService.get<{
        orders: PharmacyOrder[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>('/pharmacies/orders', params as any);
      return response;
    } catch (error) {
      console.error('Get orders failed:', error);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string) {
    try {
      const response = await apiService.get<{ order: PharmacyOrder }>(
        `/pharmacies/orders/${id}`
      );
      return response;
    } catch (error) {
      console.error('Get order failed:', error);
      throw error;
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(id: string, reason?: string) {
    try {
      const response = await apiService.put<{ order: PharmacyOrder }>(
        `/pharmacies/orders/${id}/cancel`,
        { reason }
      );
      return response;
    } catch (error) {
      console.error('Cancel order failed:', error);
      throw error;
    }
  }

  /**
   * Get active orders
   */
  async getActiveOrders() {
    try {
      const response = await this.getOrders({
        status: 'confirmed,preparing,out_for_delivery',
      });
      return response;
    } catch (error) {
      console.error('Get active orders failed:', error);
      throw error;
    }
  }

  /**
   * Get order history
   */
  async getOrderHistory(limit: number = 20) {
    try {
      const response = await this.getOrders({
        status: 'delivered,cancelled',
        limit,
      });
      return response;
    } catch (error) {
      console.error('Get order history failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const pharmacyService = new PharmacyService();

export default pharmacyService;
