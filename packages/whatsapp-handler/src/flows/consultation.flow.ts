import { Flow, FlowContext, FlowResult } from './engine';
import { apiClient, Pet, Diagnosis } from '../clients/api.client';
import { aiClient } from '../clients/ai.client';
import { logger } from '../utils/logger';

interface ConsultationState {
  currentFlow: 'consultation';
  currentStep:
    | 'start'
    | 'select-pet'
    | 'describe-symptoms'
    | 'clarifying-questions'
    | 'show-diagnosis'
    | 'treatment'
    | 'prescription';
  selectedPetId?: string;
  selectedPetName?: string;
  symptoms?: string;
  clarifyingAnswers?: string[];
  pendingQuestions?: string[];
  currentQuestionIndex?: number;
  consultationId?: string;
  diagnosis?: Diagnosis;
  [key: string]: unknown;
}

export const consultationFlow: Flow = {
  name: 'consultation',

  async process(context: FlowContext): Promise<FlowResult> {
    const state = context.session.state as ConsultationState;
    const step = state.currentStep || 'start';

    switch (step) {
      case 'start':
        return this.startConsultation(context);
      case 'select-pet':
        return this.handlePetSelection(context);
      case 'describe-symptoms':
        return this.handleSymptomDescription(context);
      case 'clarifying-questions':
        return this.handleClarifyingAnswers(context);
      case 'show-diagnosis':
        return this.handleDiagnosisResponse(context);
      case 'treatment':
        return this.handleTreatmentResponse(context);
      case 'prescription':
        return this.handlePrescriptionResponse(context);
      default:
        return this.startConsultation(context);
    }
  },

  async startConsultation(context: FlowContext): Promise<FlowResult> {
    const { session } = context;

    // Check if user is registered
    if (!session.userId) {
      return {
        messages: [
          {
            type: 'text',
            text: 'Para iniciar uma consulta, primeiro precisamos cadastrar seu pet.',
          },
        ],
        newState: {
          currentFlow: 'pet-registration',
          currentStep: 'start',
          returnFlow: 'consultation',
        },
      };
    }

    // Fetch user's pets
    const pets = await apiClient.getPets(session.userId);

    if (pets.length === 0) {
      return {
        messages: [
          {
            type: 'text',
            text: 'Voce ainda nao tem nenhum pet cadastrado. Vamos cadastrar agora?',
          },
          {
            type: 'interactive',
            interactive: {
              type: 'button',
              body: {
                text: 'Para fazer uma consulta, primeiro precisamos conhecer seu pet.',
              },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'register-pet', title: 'Cadastrar Pet' } },
                  { type: 'reply', reply: { id: 'menu', title: 'Menu' } },
                ],
              },
            },
          },
        ],
        newState: {
          currentFlow: 'pet-registration',
          currentStep: 'start',
          returnFlow: 'consultation',
        },
      };
    }

    // If only one pet, select automatically
    if (pets.length === 1) {
      return this.askForSymptoms(context, pets[0]);
    }

    // Show pet selection
    const getSpeciesEmoji = (species: string): string => {
      const emojis: Record<string, string> = {
        dog: '🐕',
        cat: '🐈',
        bird: '🐦',
        exotic: '🦎',
      };
      return emojis[species] || '🐾';
    };

    const petButtons = pets.slice(0, 3).map((pet) => ({
      type: 'reply' as const,
      reply: {
        id: `pet-${pet.id}`,
        title: `${getSpeciesEmoji(pet.species)} ${pet.name}`,
      },
    }));

    return {
      messages: [
        {
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: 'Para qual pet e a consulta?' },
            action: { buttons: petButtons },
          },
        },
      ],
      newState: {
        currentFlow: 'consultation',
        currentStep: 'select-pet',
        pets: pets.map((p) => ({ id: p.id, name: p.name, species: p.species })),
      },
    };
  },

  async handlePetSelection(context: FlowContext): Promise<FlowResult> {
    const { content, session } = context;
    const state = session.state as ConsultationState;

    let selectedPet: Pet | undefined;

    if (content.type === 'button' && content.buttonId?.startsWith('pet-')) {
      const petId = content.buttonId.replace('pet-', '');
      selectedPet = (state.pets as { id: string; name: string }[])?.find(
        (p) => p.id === petId
      ) as Pet | undefined;

      if (selectedPet) {
        return this.askForSymptoms(context, selectedPet);
      }
    }

    // Try to match by name or number
    if (content.type === 'text' && content.text) {
      const input = content.text.toLowerCase().trim();
      const pets = state.pets as { id: string; name: string }[];

      // Match by number
      const num = parseInt(input);
      if (!isNaN(num) && num > 0 && num <= pets.length) {
        selectedPet = pets[num - 1] as unknown as Pet;
      } else {
        // Match by name
        selectedPet = pets.find((p) =>
          p.name.toLowerCase().includes(input)
        ) as unknown as Pet;
      }

      if (selectedPet) {
        return this.askForSymptoms(context, selectedPet);
      }
    }

    return {
      messages: [
        {
          type: 'text',
          text: 'Por favor, selecione um pet da lista ou digite o nome.',
        },
      ],
      newState: state,
    };
  },

  async askForSymptoms(context: FlowContext, pet: Pet): Promise<FlowResult> {
    return {
      messages: [
        {
          type: 'text',
          text:
            `O que ${pet.name} esta sentindo? Descreva os sintomas com o maximo de detalhes possivel.\n\n` +
            `Dica: Mencione ha quanto tempo, frequencia e intensidade dos sintomas.`,
        },
      ],
      newState: {
        currentFlow: 'consultation',
        currentStep: 'describe-symptoms',
        selectedPetId: pet.id,
        selectedPetName: pet.name,
      },
    };
  },

  async handleSymptomDescription(context: FlowContext): Promise<FlowResult> {
    const { content, session } = context;
    const state = session.state as ConsultationState;

    if (content.type !== 'text' || !content.text) {
      return {
        messages: [
          {
            type: 'text',
            text: 'Por favor, descreva os sintomas em texto. Voce tambem pode enviar fotos depois.',
          },
        ],
        newState: state,
      };
    }

    const symptoms = content.text;

    // Start consultation in backend
    const consultation = await apiClient.startConsultation({
      petId: state.selectedPetId!,
      symptoms,
    });

    logger.info('Consultation started', {
      consultationId: consultation.id,
      petId: state.selectedPetId,
    });

    // Get AI analysis
    const pet = await apiClient.getPet(state.selectedPetId!);
    const analysis = await aiClient.analyzeSymptoms({
      symptoms,
      petId: state.selectedPetId!,
      consultationId: consultation.id,
      petInfo: {
        species: pet.species,
        breed: pet.breed,
        weight: pet.weight,
        sex: pet.sex,
        neutered: pet.neutered,
      },
    });

    if (analysis.needsClarification && analysis.clarifyingQuestions) {
      const questionsText = analysis.clarifyingQuestions
        .map((q, i) => `${i + 1}. ${q}`)
        .join('\n');

      return {
        messages: [
          {
            type: 'text',
            text: `Entendi. Para um diagnostico mais preciso, preciso de algumas informacoes:\n\n${questionsText}\n\nResponda cada pergunta separadamente.`,
          },
        ],
        newState: {
          ...state,
          currentStep: 'clarifying-questions',
          consultationId: consultation.id,
          symptoms,
          pendingQuestions: analysis.clarifyingQuestions,
          clarifyingAnswers: [],
          currentQuestionIndex: 0,
        },
      };
    }

    // Skip to diagnosis if no clarification needed
    return this.showDiagnosis(context, analysis.diagnosis!, consultation.id);
  },

  async handleClarifyingAnswers(context: FlowContext): Promise<FlowResult> {
    const { content, session } = context;
    const state = session.state as ConsultationState;

    if (content.type !== 'text' || !content.text) {
      return {
        messages: [
          {
            type: 'text',
            text: 'Por favor, responda em texto.',
          },
        ],
        newState: state,
      };
    }

    const answers = [...(state.clarifyingAnswers || []), content.text];
    const currentIndex = (state.currentQuestionIndex || 0) + 1;
    const questions = state.pendingQuestions || [];

    // If more questions to answer
    if (currentIndex < questions.length) {
      return {
        messages: [
          {
            type: 'text',
            text: `${currentIndex + 1}. ${questions[currentIndex]}`,
          },
        ],
        newState: {
          ...state,
          clarifyingAnswers: answers,
          currentQuestionIndex: currentIndex,
        },
      };
    }

    // All questions answered, get final diagnosis
    const pet = await apiClient.getPet(state.selectedPetId!);
    const analysis = await aiClient.analyzeSymptoms({
      symptoms: state.symptoms!,
      petId: state.selectedPetId!,
      consultationId: state.consultationId!,
      petInfo: {
        species: pet.species,
        breed: pet.breed,
        weight: pet.weight,
        sex: pet.sex,
        neutered: pet.neutered,
      },
      clarifyingAnswers: answers,
    });

    return this.showDiagnosis(context, analysis.diagnosis!, state.consultationId!);
  },

  async showDiagnosis(
    context: FlowContext,
    diagnosis: Diagnosis,
    consultationId: string
  ): Promise<FlowResult> {
    const state = context.session.state as ConsultationState;
    const urgencyEmoji: Record<string, string> = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      emergency: '🔴',
    };

    const differentialsText = diagnosis.differentials
      .map((d, i) => `${i + 1}. ${d.condition} (${d.probability}%)`)
      .join('\n');

    const diagnosisMessage =
      `${urgencyEmoji[diagnosis.urgencyLevel]} *ANALISE CLINICA - ${state.selectedPetName}*\n\n` +
      `*Diagnosticos Diferenciais:*\n${differentialsText}\n\n` +
      `*Diagnostico Mais Provavel:*\n${diagnosis.primary}\n\n` +
      `*Nivel de Urgencia:* ${diagnosis.urgencyLevel.toUpperCase()}`;

    // Update consultation with diagnosis
    await apiClient.updateConsultation(consultationId, {
      diagnosis,
      urgencyLevel: diagnosis.urgencyLevel,
    });

    return {
      messages: [
        { type: 'text', text: diagnosisMessage },
        {
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: 'O que voce gostaria de fazer?' },
            action: {
              buttons: [
                { type: 'reply', reply: { id: 'show-treatment', title: 'Ver Tratamento' } },
                { type: 'reply', reply: { id: 'get-prescription', title: 'Gerar Receita' } },
                { type: 'reply', reply: { id: 'menu', title: 'Menu' } },
              ],
            },
          },
        },
      ],
      newState: {
        ...state,
        currentStep: 'show-diagnosis',
        consultationId,
        diagnosis,
      },
    };
  },

  async handleDiagnosisResponse(context: FlowContext): Promise<FlowResult> {
    const { content, session } = context;
    const state = session.state as ConsultationState;

    if (content.type === 'button') {
      if (content.buttonId === 'show-treatment') {
        return this.showTreatment(context);
      }
      if (content.buttonId === 'get-prescription') {
        return this.sendPrescription(context);
      }
    }

    return {
      messages: [
        {
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: 'Por favor, selecione uma opcao:' },
            action: {
              buttons: [
                { type: 'reply', reply: { id: 'show-treatment', title: 'Ver Tratamento' } },
                { type: 'reply', reply: { id: 'get-prescription', title: 'Gerar Receita' } },
                { type: 'reply', reply: { id: 'menu', title: 'Menu' } },
              ],
            },
          },
        },
      ],
      newState: state,
    };
  },

  async showTreatment(context: FlowContext): Promise<FlowResult> {
    const state = context.session.state as ConsultationState;

    const pet = await apiClient.getPet(state.selectedPetId!);
    const treatment = await aiClient.getTreatmentProtocol({
      consultationId: state.consultationId!,
      diagnosis: state.diagnosis!,
      petInfo: {
        species: pet.species,
        weight: pet.weight,
      },
    });

    const medicationsText = treatment.medications
      .map(
        (med) =>
          `- *${med.name}*\n` +
          `  Dose: ${med.dosage}\n` +
          `  Via: ${med.route}\n` +
          `  Frequencia: ${med.frequency}\n` +
          `  Duracao: ${med.duration}`
      )
      .join('\n\n');

    const supportiveText = treatment.supportiveCare.map((care) => `- ${care}`).join('\n');

    const treatmentMessage =
      `*PROTOCOLO DE TRATAMENTO*\n\n` +
      `*Medicacoes:*\n${medicationsText}\n\n` +
      `*Cuidados de Suporte:*\n${supportiveText}\n\n` +
      `*Monitoramento:*\n` +
      `Se nao houver melhora em 48-72h, procure um veterinario presencial.`;

    // Update consultation with treatment
    await apiClient.updateConsultation(state.consultationId!, {
      treatment: {
        medications: treatment.medications,
        supportiveCare: treatment.supportiveCare,
        followUp: treatment.followUp,
      },
    });

    return {
      messages: [
        { type: 'text', text: treatmentMessage },
        {
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: 'Deseja receber a receita em PDF?' },
            action: {
              buttons: [
                { type: 'reply', reply: { id: 'get-prescription', title: 'Sim, enviar receita' } },
                { type: 'reply', reply: { id: 'menu', title: 'Finalizar' } },
              ],
            },
          },
        },
      ],
      newState: {
        ...state,
        currentStep: 'treatment',
        treatment,
      },
    };
  },

  async handleTreatmentResponse(context: FlowContext): Promise<FlowResult> {
    const { content, session } = context;
    const state = session.state as ConsultationState;

    if (content.type === 'button' && content.buttonId === 'get-prescription') {
      return this.sendPrescription(context);
    }

    return {
      messages: [],
      newState: {
        currentFlow: 'main-menu',
        currentStep: null,
      },
    };
  },

  async sendPrescription(context: FlowContext): Promise<FlowResult> {
    const state = context.session.state as ConsultationState;

    try {
      // Generate prescription PDF
      const prescriptionUrl = await apiClient.generatePrescription(state.consultationId!);

      const dateStr = new Date().toISOString().split('T')[0];

      return {
        messages: [
          {
            type: 'document',
            document: {
              url: prescriptionUrl,
              filename: `Receita_PetVet_${dateStr}.pdf`,
              caption: 'Receita Veterinaria - PetVet AI',
            },
          },
          {
            type: 'text',
            text:
              `Receita enviada!\n\n` +
              `Esta consulta foi salva no historico de saude de ${state.selectedPetName}.\n\n` +
              `Vou te lembrar sobre os medicamentos nos horarios corretos.\n\n` +
              `Melhoras para o seu pet! 🐾`,
          },
        ],
        newState: {
          currentFlow: 'main-menu',
          currentStep: null,
        },
      };
    } catch (error) {
      logger.error('Failed to generate prescription', { error });

      return {
        messages: [
          {
            type: 'text',
            text: 'Desculpe, nao consegui gerar a receita. Por favor, tente novamente.',
          },
          {
            type: 'interactive',
            interactive: {
              type: 'button',
              body: { text: 'O que deseja fazer?' },
              action: {
                buttons: [
                  { type: 'reply', reply: { id: 'get-prescription', title: 'Tentar Novamente' } },
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

  async handlePrescriptionResponse(context: FlowContext): Promise<FlowResult> {
    return {
      messages: [],
      newState: {
        currentFlow: 'main-menu',
        currentStep: null,
      },
    };
  },
};
