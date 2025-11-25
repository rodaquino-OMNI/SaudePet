import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  createdAt: string;
}

export interface Pet {
  id: string;
  userId: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'exotic';
  breed?: string;
  birthDate?: string;
  sex?: 'male' | 'female';
  weight?: number;
  neutered?: boolean;
  photoUrl?: string;
}

export interface Consultation {
  id: string;
  petId: string;
  status: 'active' | 'completed' | 'cancelled';
  symptoms?: string;
  diagnosis?: Diagnosis;
  treatment?: Treatment;
  urgencyLevel?: string;
  prescriptionUrl?: string;
  startedAt: string;
  completedAt?: string;
}

export interface Diagnosis {
  primary: string;
  differentials: Array<{
    condition: string;
    probability: number;
  }>;
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
}

export interface Treatment {
  medications: Array<{
    name: string;
    dosage: string;
    route: string;
    frequency: string;
    duration: string;
  }>;
  supportiveCare: string[];
  followUp?: string;
}

export interface HealthRecord {
  id: string;
  petId: string;
  recordType: string;
  title: string;
  description?: string;
  date: string;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.services.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-Service': 'whatsapp-handler',
      },
      timeout: 30000,
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status !== 404) {
          logger.error('API error', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message,
          });
        }
        throw error;
      }
    );
  }

  /**
   * Get user by phone number
   */
  async getUserByPhone(phoneNumber: string): Promise<User | null> {
    try {
      const response = await this.client.get<User>(`/api/v1/users/by-phone/${phoneNumber}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create a new user
   */
  async createUser(data: { phoneNumber: string; name?: string }): Promise<User> {
    const response = await this.client.post<User>('/api/v1/users', data);
    return response.data;
  }

  /**
   * Get pets for a user
   */
  async getPets(userId: string): Promise<Pet[]> {
    const response = await this.client.get<Pet[]>(`/api/v1/users/${userId}/pets`);
    return response.data;
  }

  /**
   * Create a new pet
   */
  async createPet(userId: string, data: Partial<Pet>): Promise<Pet> {
    const response = await this.client.post<Pet>(`/api/v1/users/${userId}/pets`, data);
    return response.data;
  }

  /**
   * Get pet by ID
   */
  async getPet(petId: string): Promise<Pet> {
    const response = await this.client.get<Pet>(`/api/v1/pets/${petId}`);
    return response.data;
  }

  /**
   * Start a new consultation
   */
  async startConsultation(data: { petId: string; symptoms: string }): Promise<Consultation> {
    const response = await this.client.post<Consultation>('/api/v1/consultations', data);
    return response.data;
  }

  /**
   * Update consultation
   */
  async updateConsultation(
    consultationId: string,
    data: Partial<Consultation>
  ): Promise<Consultation> {
    const response = await this.client.patch<Consultation>(
      `/api/v1/consultations/${consultationId}`,
      data
    );
    return response.data;
  }

  /**
   * Get consultation
   */
  async getConsultation(consultationId: string): Promise<Consultation> {
    const response = await this.client.get<Consultation>(
      `/api/v1/consultations/${consultationId}`
    );
    return response.data;
  }

  /**
   * Generate prescription PDF
   */
  async generatePrescription(consultationId: string): Promise<string> {
    const response = await this.client.post<{ url: string }>(
      `/api/v1/consultations/${consultationId}/prescription`
    );
    return response.data.url;
  }

  /**
   * Get health records for a pet
   */
  async getHealthRecords(petId: string): Promise<HealthRecord[]> {
    const response = await this.client.get<HealthRecord[]>(`/api/v1/pets/${petId}/records`);
    return response.data;
  }

  /**
   * Create health record
   */
  async createHealthRecord(petId: string, data: Partial<HealthRecord>): Promise<HealthRecord> {
    const response = await this.client.post<HealthRecord>(`/api/v1/pets/${petId}/records`, data);
    return response.data;
  }

  /**
   * Get subscription status
   */
  async getSubscription(userId: string): Promise<{
    plan: string;
    status: string;
    currentPeriodEnd: string;
  } | null> {
    try {
      const response = await this.client.get(`/api/v1/users/${userId}/subscription`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
