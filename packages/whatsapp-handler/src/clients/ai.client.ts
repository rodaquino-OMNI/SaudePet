import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';
import { Diagnosis, Treatment } from './api.client';

export interface SymptomAnalysisRequest {
  symptoms: string;
  petId: string;
  consultationId: string;
  petInfo?: {
    species: string;
    breed?: string;
    age?: number;
    weight?: number;
    sex?: string;
    neutered?: boolean;
  };
  clarifyingAnswers?: string[];
}

export interface SymptomAnalysisResponse {
  needsClarification: boolean;
  clarifyingQuestions?: string[];
  diagnosis?: Diagnosis;
  confidence?: number;
}

export interface TreatmentRequest {
  consultationId: string;
  diagnosis: Diagnosis;
  petInfo?: {
    species: string;
    weight?: number;
    age?: number;
  };
}

export interface TreatmentResponse {
  medications: Array<{
    name: string;
    dosage: string;
    route: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  supportiveCare: string[];
  monitoring: string[];
  followUp: string;
  warnings?: string[];
}

export interface ImageAnalysisRequest {
  imageUrl: string;
  petId: string;
  consultationId?: string;
  context?: string;
}

export interface ImageAnalysisResponse {
  findings: string[];
  concerns: string[];
  recommendations: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
}

class AIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.services.aiServicesUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-Service': 'whatsapp-handler',
      },
      timeout: 60000, // AI can take longer
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('AI Services error', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
        });
        throw error;
      }
    );
  }

  /**
   * Analyze symptoms and get diagnosis
   */
  async analyzeSymptoms(request: SymptomAnalysisRequest): Promise<SymptomAnalysisResponse> {
    const startTime = Date.now();

    try {
      const response = await this.client.post<SymptomAnalysisResponse>(
        '/api/v1/diagnosis/analyze',
        request
      );

      const duration = Date.now() - startTime;
      logger.info('Symptom analysis completed', {
        consultationId: request.consultationId,
        duration,
        needsClarification: response.data.needsClarification,
        hasdiagnosis: !!response.data.diagnosis,
      });

      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Symptom analysis failed', {
        consultationId: request.consultationId,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get treatment protocol for diagnosis
   */
  async getTreatmentProtocol(request: TreatmentRequest): Promise<TreatmentResponse> {
    const startTime = Date.now();

    try {
      const response = await this.client.post<TreatmentResponse>(
        '/api/v1/diagnosis/treatment',
        request
      );

      const duration = Date.now() - startTime;
      logger.info('Treatment protocol generated', {
        consultationId: request.consultationId,
        duration,
        medicationsCount: response.data.medications.length,
      });

      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Treatment protocol generation failed', {
        consultationId: request.consultationId,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Analyze pet image
   */
  async analyzeImage(request: ImageAnalysisRequest): Promise<ImageAnalysisResponse> {
    const startTime = Date.now();

    try {
      const response = await this.client.post<ImageAnalysisResponse>(
        '/api/v1/diagnosis/image',
        request
      );

      const duration = Date.now() - startTime;
      logger.info('Image analysis completed', {
        petId: request.petId,
        duration,
        urgencyLevel: response.data.urgencyLevel,
      });

      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Image analysis failed', {
        petId: request.petId,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Process natural language for intent classification
   */
  async classifyIntent(
    text: string,
    context?: { currentFlow?: string; previousIntents?: string[] }
  ): Promise<{
    intent: string;
    confidence: number;
    entities?: Record<string, string>;
  }> {
    const response = await this.client.post('/api/v1/nlp/intent', {
      text,
      context,
    });

    return response.data;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}

export const aiClient = new AIClient();
