import { Flow, FlowContext, FlowResult } from './engine';
import { apiClient } from '../clients/api.client';
import { logger } from '../utils/logger';

interface SubscriptionState {
  currentFlow: 'subscription';
  currentStep: 'view' | 'select-plan' | 'confirm' | 'payment';
  selectedPlan?: string;
  [key: string]: unknown;
}

const PLANS = {
  basic: {
    name: 'Basico',
    price: 'R$ 29,90/mes',
    features: ['5 consultas/mes', '1 pet'],
  },
  family: {
    name: 'Familia',
    price: 'R$ 49,90/mes',
    features: ['Consultas ilimitadas', 'Ate 3 pets'],
  },
  premium: {
    name: 'Premium',
    price: 'R$ 79,90/mes',
    features: ['Consultas ilimitadas', 'Pets ilimitados', 'Analise de imagem', 'Suporte prioritario'],
  },
};

export const subscriptionFlow: Flow = {
  name: 'subscription',

  async process(context: FlowContext): Promise<FlowResult> {
    const state = context.session.state as SubscriptionState;
    const step = state.currentStep || 'view';

    switch (step) {
      case 'view':
        return this.showCurrentSubscription(context);
      case 'select-plan':
        return this.handlePlanSelection(context);
      case 'confirm':
        return this.handleConfirmation(context);
      case 'payment':
        return this.handlePayment(context);
      default:
        return this.showCurrentSubscription(context);
    }
  },

  async showCurrentSubscription(context: FlowContext): Promise<FlowResult> {
    const { session } = context;

    if (!session.userId) {
      return this.showPlans(context, 'Conheca nossos planos:');
    }

    try {
      const subscription = await apiClient.getSubscription(session.userId);

      if (!subscription || subscription.status !== 'active') {
        return this.showPlans(context, 'Voce ainda nao tem uma assinatura ativa.');
      }

      const endDate = new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR');
      const plan = PLANS[subscription.plan as keyof typeof PLANS] || { name: subscription.plan, price: '', features: [] };

      return {
        messages: [
          {
            type: 'text',
            text:
              `*Sua Assinatura*\n\n` +
              `Plano: *${plan.name}*\n` +
              `Status: *Ativo*\n` +
              `Renovacao: ${endDate}\n\n` +
              `Beneficios:\n${plan.features.map((f) => `- ${f}`).join('\n')}`,
          },
          {
            type: 'interactive',
            interactive: {
              type: 'button',
              body: { text: 'O que deseja fazer?' },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'upgrade-plan', title: 'Mudar Plano' } },
                  { type: 'reply', reply: { id: 'cancel-subscription', title: 'Cancelar' } },
                  { type: 'reply', reply: { id: 'menu', title: 'Menu' } },
                ],
              },
            },
          },
        ],
        newState: {
          currentFlow: 'subscription',
          currentStep: 'view',
        },
      };
    } catch (error) {
      logger.error('Failed to fetch subscription', { error });
      return this.showPlans(context, 'Conheca nossos planos:');
    }
  },

  showPlans(context: FlowContext, prefix: string): FlowResult {
    const plansText = Object.entries(PLANS)
      .map(([key, plan]) => {
        return `*${plan.name}* - ${plan.price}\n${plan.features.map((f) => `  - ${f}`).join('\n')}`;
      })
      .join('\n\n');

    return {
      messages: [
        {
          type: 'text',
          text: `${prefix}\n\n${plansText}`,
        },
        {
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: 'Escolha um plano:' },
            action: {
              buttons: [
                { type: 'reply', reply: { id: 'plan-basic', title: 'Basico R$29,90' } },
                { type: 'reply', reply: { id: 'plan-family', title: 'Familia R$49,90' } },
                { type: 'reply', reply: { id: 'plan-premium', title: 'Premium R$79,90' } },
              ],
            },
          },
        },
      ],
      newState: {
        currentFlow: 'subscription',
        currentStep: 'select-plan',
      },
    };
  },

  async handlePlanSelection(context: FlowContext): Promise<FlowResult> {
    const { content, session } = context;

    let selectedPlan: string | undefined;

    if (content.type === 'button' && content.buttonId) {
      if (content.buttonId === 'upgrade-plan') {
        return this.showPlans(context, 'Escolha seu novo plano:');
      }

      if (content.buttonId === 'cancel-subscription') {
        return this.confirmCancellation(context);
      }

      if (content.buttonId.startsWith('plan-')) {
        selectedPlan = content.buttonId.replace('plan-', '');
      }
    }

    if (content.type === 'text' && content.text) {
      const normalized = content.text.toLowerCase().trim();
      if (normalized.includes('basico') || normalized === '1') {
        selectedPlan = 'basic';
      } else if (normalized.includes('familia') || normalized === '2') {
        selectedPlan = 'family';
      } else if (normalized.includes('premium') || normalized === '3') {
        selectedPlan = 'premium';
      }
    }

    if (!selectedPlan || !PLANS[selectedPlan as keyof typeof PLANS]) {
      return {
        messages: [
          {
            type: 'text',
            text: 'Por favor, selecione um plano valido.',
          },
        ],
        newState: {
          currentFlow: 'subscription',
          currentStep: 'select-plan',
        },
      };
    }

    const plan = PLANS[selectedPlan as keyof typeof PLANS];

    return {
      messages: [
        {
          type: 'text',
          text:
            `*Confirmar Assinatura*\n\n` +
            `Plano: *${plan.name}*\n` +
            `Valor: *${plan.price}*\n\n` +
            `Beneficios:\n${plan.features.map((f) => `- ${f}`).join('\n')}`,
        },
        {
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: 'Deseja confirmar esta assinatura?' },
            action: {
              buttons: [
                { type: 'reply', reply: { id: 'confirm-subscription', title: 'Confirmar' } },
                { type: 'reply', reply: { id: 'change-plan', title: 'Mudar Plano' } },
                { type: 'reply', reply: { id: 'menu', title: 'Cancelar' } },
              ],
            },
          },
        },
      ],
      newState: {
        currentFlow: 'subscription',
        currentStep: 'confirm',
        selectedPlan,
      },
    };
  },

  async handleConfirmation(context: FlowContext): Promise<FlowResult> {
    const { content, session } = context;
    const state = session.state as SubscriptionState;

    if (content.type === 'button') {
      if (content.buttonId === 'confirm-subscription') {
        // Check if user is registered
        if (!session.userId) {
          return {
            messages: [
              {
                type: 'text',
                text: 'Para assinar, primeiro precisamos cadastrar você. Vamos criar seu perfil?',
              },
            ],
            newState: {
              currentFlow: 'pet-registration',
              currentStep: 'start',
              returnFlow: 'subscription',
              returnData: { selectedPlan: state.selectedPlan },
            },
          };
        }

        return this.processSubscription(context, state.selectedPlan!);
      }

      if (content.buttonId === 'change-plan') {
        return this.showPlans(context, 'Escolha seu plano:');
      }
    }

    return {
      messages: [
        {
          type: 'text',
          text: 'Por favor, confirme ou altere seu plano.',
        },
      ],
      newState: state,
    };
  },

  async processSubscription(context: FlowContext, plan: string): Promise<FlowResult> {
    const { session } = context;

    try {
      // Create subscription via API
      const result = await apiClient.createSubscription({
        userId: session.userId!,
        plan,
      });

      if (result.checkoutUrl) {
        // Stripe checkout flow
        return {
          messages: [
            {
              type: 'text',
              text:
                `Para finalizar sua assinatura, acesse o link de pagamento:\n\n` +
                `${result.checkoutUrl}\n\n` +
                `Apos o pagamento, sua assinatura sera ativada automaticamente.`,
            },
            {
              type: 'interactive',
              interactive: {
                type: 'button',
                body: { text: 'Precisa de ajuda?' },
                action: {
                  buttons: [{ type: 'reply', reply: { id: 'menu', title: 'Voltar ao Menu' } }],
                },
              },
            },
          ],
          newState: {
            currentFlow: 'main-menu',
            currentStep: null,
          },
        };
      }

      // Mock subscription (dev mode)
      const planInfo = PLANS[plan as keyof typeof PLANS];

      return {
        messages: [
          {
            type: 'text',
            text:
              `*Assinatura Ativada!*\n\n` +
              `Plano: *${planInfo.name}*\n\n` +
              `Agora voce pode aproveitar todos os beneficios:\n` +
              `${planInfo.features.map((f) => `- ${f}`).join('\n')}\n\n` +
              `Obrigado por assinar o PetVet AI!`,
          },
          {
            type: 'interactive',
            interactive: {
              type: 'button',
              body: { text: 'O que deseja fazer agora?' },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'new-consultation', title: 'Nova Consulta' } },
                  { type: 'reply', reply: { id: 'menu', title: 'Menu' } },
                ],
              },
            },
          },
        ],
        newState: {
          currentFlow: 'main-menu',
          currentStep: null,
        },
      };
    } catch (error) {
      logger.error('Failed to create subscription', { error });

      return {
        messages: [
          {
            type: 'text',
            text: 'Desculpe, ocorreu um erro ao processar sua assinatura. Por favor, tente novamente.',
          },
          {
            type: 'interactive',
            interactive: {
              type: 'button',
              body: { text: 'O que deseja fazer?' },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'plan-' + plan, title: 'Tentar Novamente' } },
                  { type: 'reply', reply: { id: 'menu', title: 'Menu' } },
                ],
              },
            },
          },
        ],
        newState: {
          currentFlow: 'subscription',
          currentStep: 'select-plan',
        },
      };
    }
  },

  confirmCancellation(context: FlowContext): FlowResult {
    return {
      messages: [
        {
          type: 'text',
          text:
            `*Cancelar Assinatura*\n\n` +
            `Tem certeza que deseja cancelar sua assinatura?\n\n` +
            `Voce perdera acesso a:\n` +
            `- Consultas ilimitadas\n` +
            `- Historico de saude\n` +
            `- Lembretes de vacinacao\n\n` +
            `A assinatura permanecera ativa ate o fim do periodo atual.`,
        },
        {
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: 'Confirmar cancelamento?' },
            action: {
              buttons: [
                { type: 'reply', reply: { id: 'confirm-cancel', title: 'Sim, Cancelar' } },
                { type: 'reply', reply: { id: 'menu', title: 'Nao, Manter' } },
              ],
            },
          },
        },
      ],
      newState: {
        currentFlow: 'subscription',
        currentStep: 'cancel-confirm',
      },
    };
  },

  async handlePayment(context: FlowContext): Promise<FlowResult> {
    // Handle payment confirmation (webhook callback would update status)
    return {
      messages: [
        {
          type: 'text',
          text: 'Aguardando confirmacao do pagamento...',
        },
      ],
      newState: {
        currentFlow: 'main-menu',
        currentStep: null,
      },
    };
  },
};
