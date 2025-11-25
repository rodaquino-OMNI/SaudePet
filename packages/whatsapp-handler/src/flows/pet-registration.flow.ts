import { Flow, FlowContext, FlowResult } from './engine';
import { apiClient } from '../clients/api.client';
import { sessionService } from '../services/session.service';
import { logger } from '../utils/logger';

interface PetRegistrationState {
  currentFlow: 'pet-registration';
  currentStep:
    | 'start'
    | 'name'
    | 'species'
    | 'breed'
    | 'age'
    | 'sex'
    | 'weight'
    | 'confirm';
  returnFlow?: string;
  petData?: {
    name?: string;
    species?: 'dog' | 'cat' | 'bird' | 'exotic';
    breed?: string;
    birthDate?: string;
    sex?: 'male' | 'female';
    weight?: number;
  };
  [key: string]: unknown;
}

export const petRegistrationFlow: Flow = {
  name: 'pet-registration',

  async process(context: FlowContext): Promise<FlowResult> {
    const state = context.session.state as PetRegistrationState;
    const step = state.currentStep || 'start';

    switch (step) {
      case 'start':
        return this.askName(context);
      case 'name':
        return this.handleName(context);
      case 'species':
        return this.handleSpecies(context);
      case 'breed':
        return this.handleBreed(context);
      case 'age':
        return this.handleAge(context);
      case 'sex':
        return this.handleSex(context);
      case 'weight':
        return this.handleWeight(context);
      case 'confirm':
        return this.handleConfirm(context);
      default:
        return this.askName(context);
    }
  },

  askName(context: FlowContext): FlowResult {
    const state = context.session.state as PetRegistrationState;

    return {
      messages: [
        {
          type: 'text',
          text: 'Vamos cadastrar seu pet! Qual e o nome dele?',
        },
      ],
      newState: {
        ...state,
        currentFlow: 'pet-registration',
        currentStep: 'name',
        petData: {},
      },
    };
  },

  async handleName(context: FlowContext): Promise<FlowResult> {
    const { content, session } = context;
    const state = session.state as PetRegistrationState;

    if (content.type !== 'text' || !content.text) {
      return {
        messages: [{ type: 'text', text: 'Por favor, digite o nome do seu pet.' }],
        newState: state,
      };
    }

    const name = content.text.trim();

    if (name.length < 2 || name.length > 50) {
      return {
        messages: [
          { type: 'text', text: 'O nome deve ter entre 2 e 50 caracteres. Tente novamente.' },
        ],
        newState: state,
      };
    }

    return {
      messages: [
        {
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: `${name}, que nome lindo! Qual e a especie?` },
            action: {
              buttons: [
                { type: 'reply', reply: { id: 'dog', title: 'Cachorro' } },
                { type: 'reply', reply: { id: 'cat', title: 'Gato' } },
                { type: 'reply', reply: { id: 'other', title: 'Outro' } },
              ],
            },
          },
        },
      ],
      newState: {
        ...state,
        currentStep: 'species',
        petData: { ...state.petData, name },
      },
    };
  },

  async handleSpecies(context: FlowContext): Promise<FlowResult> {
    const { content, session } = context;
    const state = session.state as PetRegistrationState;

    let species: 'dog' | 'cat' | 'bird' | 'exotic' | undefined;

    if (content.type === 'button') {
      if (content.buttonId === 'dog') species = 'dog';
      else if (content.buttonId === 'cat') species = 'cat';
      else if (content.buttonId === 'other') {
        return {
          messages: [
            {
              type: 'interactive',
              interactive: {
                type: 'button',
                body: { text: 'Qual tipo de animal?' },
                action: {
                  buttons: [
                    { type: 'reply', reply: { id: 'bird', title: 'Ave' } },
                    { type: 'reply', reply: { id: 'exotic', title: 'Exotico' } },
                  ],
                },
              },
            },
          ],
          newState: state,
        };
      } else if (content.buttonId === 'bird') species = 'bird';
      else if (content.buttonId === 'exotic') species = 'exotic';
    }

    if (!species) {
      return {
        messages: [{ type: 'text', text: 'Por favor, selecione a especie do seu pet.' }],
        newState: state,
      };
    }

    const breedQuestion =
      species === 'dog'
        ? 'Qual a raca do cachorro? (ou digite "vira-lata" se nao souber)'
        : species === 'cat'
          ? 'Qual a raca do gato? (ou digite "SRD" se nao souber)'
          : 'Qual a especie especifica? (ex: papagaio, hamster)';

    return {
      messages: [{ type: 'text', text: breedQuestion }],
      newState: {
        ...state,
        currentStep: 'breed',
        petData: { ...state.petData, species },
      },
    };
  },

  async handleBreed(context: FlowContext): Promise<FlowResult> {
    const { content, session } = context;
    const state = session.state as PetRegistrationState;

    if (content.type !== 'text' || !content.text) {
      return {
        messages: [{ type: 'text', text: 'Por favor, digite a raca ou especie.' }],
        newState: state,
      };
    }

    const breed = content.text.trim();

    return {
      messages: [
        {
          type: 'text',
          text: `Qual a idade aproximada de ${state.petData?.name}?\n\nExemplos: "2 anos", "6 meses", "nao sei"`,
        },
      ],
      newState: {
        ...state,
        currentStep: 'age',
        petData: { ...state.petData, breed },
      },
    };
  },

  async handleAge(context: FlowContext): Promise<FlowResult> {
    const { content, session } = context;
    const state = session.state as PetRegistrationState;

    if (content.type !== 'text' || !content.text) {
      return {
        messages: [{ type: 'text', text: 'Por favor, informe a idade.' }],
        newState: state,
      };
    }

    const ageText = content.text.toLowerCase().trim();
    let birthDate: string | undefined;

    // Parse age
    if (ageText !== 'nao sei' && ageText !== 'nao sei') {
      const yearsMatch = ageText.match(/(\d+)\s*(ano|anos)/);
      const monthsMatch = ageText.match(/(\d+)\s*(mes|meses)/);

      const now = new Date();
      if (yearsMatch) {
        const years = parseInt(yearsMatch[1]);
        birthDate = new Date(now.getFullYear() - years, now.getMonth(), 1)
          .toISOString()
          .split('T')[0];
      } else if (monthsMatch) {
        const months = parseInt(monthsMatch[1]);
        const date = new Date(now);
        date.setMonth(date.getMonth() - months);
        birthDate = date.toISOString().split('T')[0];
      }
    }

    return {
      messages: [
        {
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: `${state.petData?.name} e macho ou femea?` },
            action: {
              buttons: [
                { type: 'reply', reply: { id: 'male', title: 'Macho' } },
                { type: 'reply', reply: { id: 'female', title: 'Femea' } },
              ],
            },
          },
        },
      ],
      newState: {
        ...state,
        currentStep: 'sex',
        petData: { ...state.petData, birthDate },
      },
    };
  },

  async handleSex(context: FlowContext): Promise<FlowResult> {
    const { content, session } = context;
    const state = session.state as PetRegistrationState;

    let sex: 'male' | 'female' | undefined;

    if (content.type === 'button') {
      if (content.buttonId === 'male') sex = 'male';
      else if (content.buttonId === 'female') sex = 'female';
    }

    if (!sex) {
      return {
        messages: [{ type: 'text', text: 'Por favor, selecione macho ou femea.' }],
        newState: state,
      };
    }

    return {
      messages: [
        {
          type: 'text',
          text: `Qual o peso aproximado de ${state.petData?.name} em kg?\n\nExemplo: "8.5" ou "nao sei"`,
        },
      ],
      newState: {
        ...state,
        currentStep: 'weight',
        petData: { ...state.petData, sex },
      },
    };
  },

  async handleWeight(context: FlowContext): Promise<FlowResult> {
    const { content, session } = context;
    const state = session.state as PetRegistrationState;

    if (content.type !== 'text' || !content.text) {
      return {
        messages: [{ type: 'text', text: 'Por favor, informe o peso.' }],
        newState: state,
      };
    }

    const weightText = content.text.toLowerCase().trim();
    let weight: number | undefined;

    if (weightText !== 'nao sei' && weightText !== 'nao sei') {
      const parsed = parseFloat(weightText.replace(',', '.'));
      if (!isNaN(parsed) && parsed > 0 && parsed < 500) {
        weight = parsed;
      }
    }

    // Show confirmation
    const pet = state.petData!;
    const speciesName = {
      dog: 'Cachorro',
      cat: 'Gato',
      bird: 'Ave',
      exotic: 'Exotico',
    }[pet.species!];

    const confirmText =
      `*Confirme os dados de ${pet.name}:*\n\n` +
      `Especie: ${speciesName}\n` +
      `Raca: ${pet.breed || 'Nao informado'}\n` +
      `Sexo: ${pet.sex === 'male' ? 'Macho' : 'Femea'}\n` +
      `Peso: ${weight ? `${weight} kg` : 'Nao informado'}\n\n` +
      `Os dados estao corretos?`;

    return {
      messages: [
        {
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: confirmText },
            action: {
              buttons: [
                { type: 'reply', reply: { id: 'confirm', title: 'Sim, confirmar' } },
                { type: 'reply', reply: { id: 'restart', title: 'Corrigir dados' } },
              ],
            },
          },
        },
      ],
      newState: {
        ...state,
        currentStep: 'confirm',
        petData: { ...state.petData, weight },
      },
    };
  },

  async handleConfirm(context: FlowContext): Promise<FlowResult> {
    const { content, session } = context;
    const state = session.state as PetRegistrationState;

    if (content.type === 'button' && content.buttonId === 'restart') {
      return this.askName(context);
    }

    if (content.type !== 'button' || content.buttonId !== 'confirm') {
      return {
        messages: [{ type: 'text', text: 'Por favor, confirme ou corrija os dados.' }],
        newState: state,
      };
    }

    try {
      // Create user if not exists
      let userId = session.userId;
      if (!userId) {
        const user = await apiClient.createUser({
          phoneNumber: session.phoneNumber,
          name: session.contactName,
        });
        userId = user.id;
        await sessionService.setUserId(session.phoneNumber, userId);
        logger.info('User created', { userId });
      }

      // Create pet
      const pet = await apiClient.createPet(userId, {
        name: state.petData!.name!,
        species: state.petData!.species!,
        breed: state.petData!.breed,
        birthDate: state.petData!.birthDate,
        sex: state.petData!.sex,
        weight: state.petData!.weight,
      });

      logger.info('Pet created', { petId: pet.id, userId });

      // Set as active pet
      await sessionService.setActivePet(session.phoneNumber, pet.id);

      // Determine where to go next
      const returnFlow = state.returnFlow;

      if (returnFlow === 'consultation') {
        return {
          messages: [
            {
              type: 'text',
              text: `${pet.name} foi cadastrado com sucesso! 🎉\n\nAgora vamos iniciar a consulta.`,
            },
          ],
          newState: {
            currentFlow: 'consultation',
            currentStep: 'start',
          },
        };
      }

      return {
        messages: [
          {
            type: 'text',
            text: `${pet.name} foi cadastrado com sucesso! 🎉\n\nAgora voce pode fazer consultas e acompanhar a saude do seu pet.`,
          },
          {
            type: 'interactive',
            interactive: {
              type: 'button',
              body: { text: 'O que deseja fazer agora?' },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'new-consultation', title: 'Nova Consulta' } },
                  { type: 'reply', reply: { id: 'menu', title: 'Menu Principal' } },
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
      logger.error('Failed to create pet', { error });

      return {
        messages: [
          {
            type: 'text',
            text: 'Desculpe, ocorreu um erro ao cadastrar o pet. Por favor, tente novamente.',
          },
          {
            type: 'interactive',
            interactive: {
              type: 'button',
              body: { text: 'Tentar novamente?' },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'restart', title: 'Sim' } },
                  { type: 'reply', reply: { id: 'menu', title: 'Voltar ao Menu' } },
                ],
              },
            },
          },
        ],
        newState: state,
      };
    }
  },
};
