/**
 * CloudWatch Custom Metrics for WhatsApp Handler
 * Records operational and business metrics for monitoring
 */

import { CloudWatch } from '@aws-sdk/client-cloudwatch';
import { config } from '../config';
import { logger } from './logger';

const cloudwatch = new CloudWatch({
  region: config.aws?.region || 'us-east-1',
});

const NAMESPACE = 'PetVet/WhatsApp';
const BUSINESS_NAMESPACE = 'PetVet/Business';
const AI_NAMESPACE = 'PetVet/AI';

interface MetricData {
  metricName: string;
  value: number;
  unit: 'Count' | 'Milliseconds' | 'Percent' | 'None';
  dimensions?: Array<{ name: string; value: string }>;
  namespace?: string;
}

class Metrics {
  private enabled: boolean;

  constructor() {
    // Only enable metrics in production or if explicitly enabled
    this.enabled = config.env === 'production' || process.env.ENABLE_METRICS === 'true';
  }

  private async publish(data: MetricData): Promise<void> {
    if (!this.enabled) {
      logger.debug('Metrics disabled, skipping', { metric: data.metricName });
      return;
    }

    try {
      await cloudwatch.putMetricData({
        Namespace: data.namespace || NAMESPACE,
        MetricData: [
          {
            MetricName: data.metricName,
            Value: data.value,
            Unit: data.unit,
            Dimensions: data.dimensions?.map((d) => ({
              Name: d.name,
              Value: d.value,
            })),
            Timestamp: new Date(),
          },
        ],
      });

      logger.debug('Metric published', { metric: data.metricName, value: data.value });
    } catch (error) {
      // Don't fail the request if metrics fail
      logger.warn('Failed to publish metric', {
        metric: data.metricName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Record webhook invocation
   */
  async recordWebhook(duration: number, success: boolean): Promise<void> {
    await Promise.all([
      this.publish({
        metricName: 'WebhookCount',
        value: 1,
        unit: 'Count',
        dimensions: [{ name: 'Status', value: success ? 'Success' : 'Error' }],
      }),
      this.publish({
        metricName: 'WebhookDuration',
        value: duration,
        unit: 'Milliseconds',
      }),
    ]);
  }

  /**
   * Record message sent or received
   */
  async recordMessage(
    type: 'text' | 'image' | 'document' | 'interactive' | 'template',
    direction: 'inbound' | 'outbound'
  ): Promise<void> {
    await this.publish({
      metricName: 'MessageCount',
      value: 1,
      unit: 'Count',
      dimensions: [
        { name: 'Type', value: type },
        { name: 'Direction', value: direction },
      ],
    });
  }

  /**
   * Record session creation
   */
  async recordSessionCreated(isNewUser: boolean): Promise<void> {
    await this.publish({
      metricName: 'SessionCreated',
      value: 1,
      unit: 'Count',
      dimensions: [{ name: 'UserType', value: isNewUser ? 'New' : 'Existing' }],
    });
  }

  /**
   * Record flow transition
   */
  async recordFlowTransition(fromFlow: string, toFlow: string): Promise<void> {
    await this.publish({
      metricName: 'FlowTransition',
      value: 1,
      unit: 'Count',
      dimensions: [
        { name: 'FromFlow', value: fromFlow },
        { name: 'ToFlow', value: toFlow },
      ],
    });
  }

  /**
   * Record consultation
   */
  async recordConsultation(completed: boolean, urgencyLevel: string): Promise<void> {
    await this.publish({
      metricName: 'ConsultationCount',
      value: 1,
      unit: 'Count',
      dimensions: [
        { name: 'Status', value: completed ? 'Completed' : 'Abandoned' },
        { name: 'Urgency', value: urgencyLevel },
      ],
      namespace: BUSINESS_NAMESPACE,
    });
  }

  /**
   * Record prescription generated
   */
  async recordPrescription(petSpecies: string): Promise<void> {
    await this.publish({
      metricName: 'PrescriptionGenerated',
      value: 1,
      unit: 'Count',
      dimensions: [{ name: 'Species', value: petSpecies }],
      namespace: BUSINESS_NAMESPACE,
    });
  }

  /**
   * Record LLM API latency
   */
  async recordLLMLatency(provider: string, duration: number, success: boolean): Promise<void> {
    await Promise.all([
      this.publish({
        metricName: 'LLMLatency',
        value: duration,
        unit: 'Milliseconds',
        dimensions: [{ name: 'Provider', value: provider }],
        namespace: AI_NAMESPACE,
      }),
      this.publish({
        metricName: 'LLMRequest',
        value: 1,
        unit: 'Count',
        dimensions: [
          { name: 'Provider', value: provider },
          { name: 'Status', value: success ? 'Success' : 'Error' },
        ],
        namespace: AI_NAMESPACE,
      }),
    ]);
  }

  /**
   * Record queue depth
   */
  async recordQueueDepth(depth: number): Promise<void> {
    await this.publish({
      metricName: 'MessageQueueDepth',
      value: depth,
      unit: 'Count',
    });
  }

  /**
   * Record user registration
   */
  async recordUserRegistration(): Promise<void> {
    await this.publish({
      metricName: 'UserRegistration',
      value: 1,
      unit: 'Count',
      namespace: BUSINESS_NAMESPACE,
    });
  }

  /**
   * Record pet registration
   */
  async recordPetRegistration(species: string): Promise<void> {
    await this.publish({
      metricName: 'PetRegistration',
      value: 1,
      unit: 'Count',
      dimensions: [{ name: 'Species', value: species }],
      namespace: BUSINESS_NAMESPACE,
    });
  }

  /**
   * Record subscription event
   */
  async recordSubscription(plan: string, action: 'created' | 'upgraded' | 'downgraded' | 'cancelled'): Promise<void> {
    await this.publish({
      metricName: 'SubscriptionEvent',
      value: 1,
      unit: 'Count',
      dimensions: [
        { name: 'Plan', value: plan },
        { name: 'Action', value: action },
      ],
      namespace: BUSINESS_NAMESPACE,
    });
  }

  /**
   * Record error
   */
  async recordError(errorType: string, flow?: string): Promise<void> {
    await this.publish({
      metricName: 'ErrorCount',
      value: 1,
      unit: 'Count',
      dimensions: [
        { name: 'ErrorType', value: errorType },
        ...(flow ? [{ name: 'Flow', value: flow }] : []),
      ],
    });
  }
}

export const metrics = new Metrics();
