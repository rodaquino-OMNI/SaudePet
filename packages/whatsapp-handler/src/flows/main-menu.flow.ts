import { Flow, FlowContext, FlowResult } from './engine';
import { apiClient } from '../clients/api.client';
import { logger } from '../utils/logger';

interface MainMenuFlow extends Flow {
  showMenu(context: FlowContext, prefix?: string): FlowResult;
  handleButtonResponse(context: FlowContext, buttonId: string): Promise<FlowResult>;
  handleTextInput(context: FlowContext, text: string): Promise<FlowResult>;
  showPetsList(context: FlowContext): Promise<FlowResult>;
  showHealthHistory(context: FlowContext): Promise<FlowResult>;
  showSubscription(context: FlowContext): Promise<FlowResult>;
  showHelp(context: FlowContext): FlowResult;
}

export const mainMenuFlow: MainMenuFlow = {
  name: 'main-menu',

  async process(context: FlowContext): Promise<FlowResult> {
    const { content, session } = context;

    // Handle button responses
    if (content.type === 'button' && content.buttonId) {
      return this.handleButtonResponse(context, content.buttonId);
    }

    // Handle text input
    if (content.type === 'text' && content.text) {
      return this.handleTextInput(context, content.text);
    }

    // Default: show menu
    return this.showMenu(context);
  },

  async handleButtonResponse(
    context: FlowContext,
    buttonId: string
  ): Promise<FlowResult> {
    switch (buttonId) {
      case 'new-consultation':
        return {
          messages: [],
          newState: {
            currentFlow: 'consultation',
            currentStep: 'start',
          },
        };

      case 'my-pets':
        return this.showPetsList(context);

      case 'health-history':
        return this.showHealthHistory(context);

      case 'subscription':
        return this.showSubscription(context);

      case 'help':
        return this.showHelp(context);

      default:
        return this.showMenu(context);
    }
  },

  async handleTextInput(context: FlowContext, text: string): Promise<FlowResult> {
    const normalized = text.toLowerCase().trim();

    // Natural language intent detection
    if (
      normalized.includes('consulta') ||
      normalized.includes('doente') ||
      normalized.includes('sintoma')
    ) {
      return {
        messages: [],
        newState: {
          currentFlow: 'consultation',
          currentStep: 'start',
        },
      };
    }

    if (normalized.includes('pet') || normalized.includes('cachorro') || normalized.includes('gato')) {
      return this.showPetsList(context);
    }

    if (normalized.includes('historico') || normalized.includes('registro')) {
      return this.showHealthHistory(context);
    }

    // Default: show menu with greeting
    return this.showMenu(context);
  },

  showMenu(context: FlowContext, prefix?: string): FlowResult {
    const greeting = context.session.contactName
      ? `Ola, ${context.session.contactName}!`
      : 'Ola!';

    const menuText =
      (prefix ? `${prefix}\n\n` : '') +
      `${greeting} Sou o PetVet IA, seu veterinario virtual.\n\n` +
      'Como posso ajudar?';

    return {
      messages: [
        {
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: menuText },
            action: {
              buttons: [
                { type: 'reply', reply: { id: 'new-consultation', title: 'Nova Consulta' } },
                { type: 'reply', reply: { id: 'my-pets', title: 'Meus Pets' } },
                { type: 'reply', reply: { id: 'health-history', title: 'Historico' } },
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
  },

  async showPetsList(context: FlowContext): Promise<FlowResult> {
    const { session } = context;

    if (!session.userId) {
      return {
        messages: [
          {
            type: 'text',
            text: 'Voce ainda nao tem pets cadastrados. Vamos cadastrar seu primeiro pet?',
          },
          {
            type: 'interactive',
            interactive: {
              type: 'button',
              body: { text: 'Clique abaixo para comecar:' },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'register-pet', title: 'Cadastrar Pet' } },
                  { type: 'reply', reply: { id: 'menu', title: 'Voltar ao Menu' } },
                ],
              },
            },
          },
        ],
        newState: {
          currentFlow: 'pet-registration',
          currentStep: 'start',
        },
      };
    }

    try {
      const pets = await apiClient.getPets(session.userId);

      if (pets.length === 0) {
        return {
          messages: [
            {
              type: 'text',
              text: 'Voce ainda nao tem pets cadastrados.',
            },
            {
              type: 'interactive',
              interactive: {
                type: 'button',
                body: { text: 'Deseja cadastrar seu primeiro pet?' },
                action: {
                  buttons: [
                    { type: 'reply', reply: { id: 'register-pet', title: 'Cadastrar Pet' } },
                    { type: 'reply', reply: { id: 'menu', title: 'Voltar ao Menu' } },
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
      }

      const getSpeciesEmoji = (species: string): string => {
        const emojis: Record<string, string> = {
          dog: '🐕',
          cat: '🐈',
          bird: '🐦',
          exotic: '🦎',
        };
        return emojis[species] || '🐾';
      };

      const petsList = pets
        .map((pet, index) => {
          const emoji = getSpeciesEmoji(pet.species);
          const age = pet.birthDate ? calculateAge(pet.birthDate) : '';
          return `${index + 1}. ${emoji} *${pet.name}*${pet.breed ? ` - ${pet.breed}` : ''}${age ? ` (${age})` : ''}`;
        })
        .join('\n');

      return {
        messages: [
          {
            type: 'text',
            text: `*Seus Pets*\n\n${petsList}\n\nEnvie o numero do pet para ver detalhes.`,
          },
          {
            type: 'interactive',
            interactive: {
              type: 'button',
              body: { text: 'Ou escolha uma opcao:' },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'register-pet', title: 'Novo Pet' } },
                  { type: 'reply', reply: { id: 'menu', title: 'Voltar ao Menu' } },
                ],
              },
            },
          },
        ],
        newState: {
          currentFlow: 'main-menu',
          currentStep: 'pets-list',
          pets: pets.map((p) => ({ id: p.id, name: p.name })),
        },
      };
    } catch (error) {
      logger.error('Failed to fetch pets', { error });
      return this.showMenu(context, 'Desculpe, nao consegui carregar seus pets.');
    }
  },

  async showHealthHistory(context: FlowContext): Promise<FlowResult> {
    const { session } = context;

    if (!session.userId) {
      return this.showMenu(context, 'Para ver o historico, primeiro cadastre seu pet.');
    }

    if (!session.activePetId) {
      return this.showPetsList(context);
    }

    try {
      const records = await apiClient.getHealthRecords(session.activePetId);
      const pet = await apiClient.getPet(session.activePetId);

      if (records.length === 0) {
        return {
          messages: [
            {
              type: 'text',
              text: `*Historico de ${pet.name}*\n\nNenhum registro de saude encontrado.\n\nInicie uma consulta para comecar a registrar o historico de saude do seu pet.`,
            },
            {
              type: 'interactive',
              interactive: {
                type: 'button',
                body: { text: 'O que deseja fazer?' },
                action: {
                  buttons: [
                    { type: 'reply', reply: { id: 'new-consultation', title: 'Nova Consulta' } },
                    { type: 'reply', reply: { id: 'menu', title: 'Voltar ao Menu' } },
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
      }

      const recentRecords = records.slice(0, 5);
      const recordsList = recentRecords
        .map((record) => {
          const date = new Date(record.date).toLocaleDateString('pt-BR');
          return `- *${date}*: ${record.title}`;
        })
        .join('\n');

      return {
        messages: [
          {
            type: 'text',
            text: `*Historico de ${pet.name}*\n\nUltimos registros:\n${recordsList}`,
          },
          {
            type: 'interactive',
            interactive: {
              type: 'button',
              body: { text: 'O que deseja fazer?' },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'new-consultation', title: 'Nova Consulta' } },
                  { type: 'reply', reply: { id: 'menu', title: 'Voltar ao Menu' } },
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
      logger.error('Failed to fetch health history', { error });
      return this.showMenu(context, 'Desculpe, nao consegui carregar o historico.');
    }
  },

  async showSubscription(context: FlowContext): Promise<FlowResult> {
    const { session } = context;

    if (!session.userId) {
      return {
        messages: [
          {
            type: 'text',
            text:
              '*Planos PetVet AI*\n\n' +
              '*Basico* - R$ 29,90/mes\n' +
              '- 5 consultas/mes\n' +
              '- 1 pet\n\n' +
              '*Familia* - R$ 49,90/mes\n' +
              '- Consultas ilimitadas\n' +
              '- Ate 3 pets\n\n' +
              '*Premium* - R$ 79,90/mes\n' +
              '- Consultas ilimitadas\n' +
              '- Pets ilimitados\n' +
              '- Analise de imagem\n' +
              '- Suporte prioritario',
          },
          {
            type: 'interactive',
            interactive: {
              type: 'button',
              body: { text: 'Cadastre-se para assinar!' },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'register-pet', title: 'Comecar' } },
                  { type: 'reply', reply: { id: 'menu', title: 'Voltar ao Menu' } },
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
    }

    try {
      const subscription = await apiClient.getSubscription(session.userId);

      if (!subscription) {
        return {
          messages: [
            {
              type: 'text',
              text: 'Voce ainda nao possui uma assinatura ativa.',
            },
          ],
          newState: {
            currentFlow: 'main-menu',
            currentStep: null,
          },
        };
      }

      const endDate = new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR');

      return {
        messages: [
          {
            type: 'text',
            text:
              `*Sua Assinatura*\n\n` +
              `Plano: *${subscription.plan}*\n` +
              `Status: *${subscription.status === 'active' ? 'Ativo' : subscription.status}*\n` +
              `Renovacao: ${endDate}`,
          },
          {
            type: 'interactive',
            interactive: {
              type: 'button',
              body: { text: 'Precisa de ajuda com sua assinatura?' },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'menu', title: 'Voltar ao Menu' } },
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
      logger.error('Failed to fetch subscription', { error });
      return this.showMenu(context, 'Desculpe, nao consegui carregar sua assinatura.');
    }
  },

  showHelp(context: FlowContext): FlowResult {
    return {
      messages: [
        {
          type: 'text',
          text:
            '*Ajuda - PetVet AI*\n\n' +
            '*Nova Consulta*\n' +
            'Descreva os sintomas do seu pet e receba um diagnostico preliminar com recomendacoes de tratamento.\n\n' +
            '*Meus Pets*\n' +
            'Gerencie os pets cadastrados e veja informacoes de cada um.\n\n' +
            '*Historico*\n' +
            'Acesse o historico de consultas e registros de saude.\n\n' +
            '*Assinatura*\n' +
            'Veja seu plano atual e opcoes de upgrade.\n\n' +
            'Para duvidas, envie um email para suporte@petvet.ai',
        },
        {
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: 'Voltar ao menu principal?' },
            action: {
              buttons: [{ type: 'reply', reply: { id: 'menu', title: 'Menu Principal' } }],
            },
          },
        },
      ],
      newState: {
        currentFlow: 'main-menu',
        currentStep: null,
      },
    };
  },
};

function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();

  if (years > 0) {
    return `${years} ano${years > 1 ? 's' : ''}`;
  }
  if (months > 0) {
    return `${months} mes${months > 1 ? 'es' : ''}`;
  }
  return 'Filhote';
}
