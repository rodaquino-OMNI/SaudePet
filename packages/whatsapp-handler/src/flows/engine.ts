import { Session, SessionState } from '../services/session.service';
import { MessageContent, WhatsAppOutboundMessage } from '../types/whatsapp';
import { logger } from '../utils/logger';
import { mainMenuFlow } from './main-menu.flow';
import { consultationFlow } from './consultation.flow';
import { petRegistrationFlow } from './pet-registration.flow';
import { subscriptionFlow } from './subscription.flow';

export interface FlowContext {
  session: Session;
  messageType: string;
  content: MessageContent;
  messageId: string;
}

export interface FlowResult {
  messages: WhatsAppOutboundMessage[];
  newState: SessionState;
}

export interface Flow {
  name: string;
  process(context: FlowContext): Promise<FlowResult>;
  [key: string]: any; // Allow additional step methods for specific flows
}

const flows: Record<string, Flow> = {
  'main-menu': mainMenuFlow,
  'consultation': consultationFlow,
  'pet-registration': petRegistrationFlow,
  'subscription': subscriptionFlow,
};

class FlowEngine {
  /**
   * Process a message through the appropriate flow
   */
  async process(context: FlowContext): Promise<FlowResult> {
    const { session, content } = context;

    // Determine current flow
    const currentFlowName = session.state.currentFlow || 'main-menu';
    const currentFlow = flows[currentFlowName];

    if (!currentFlow) {
      logger.error('Unknown flow', { flowName: currentFlowName });
      return this.handleError(context);
    }

    // Check for global commands
    if (content.type === 'text' && content.text) {
      const globalResult = await this.handleGlobalCommands(content.text, context);
      if (globalResult) {
        return globalResult;
      }
    }

    // Process through current flow
    try {
      logger.debug('Processing through flow', {
        flow: currentFlowName,
        step: session.state.currentStep,
        contentType: content.type,
      });

      return await currentFlow.process(context);
    } catch (error) {
      logger.error('Flow processing error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        flow: currentFlowName,
        step: session.state.currentStep,
      });
      return this.handleError(context);
    }
  }

  /**
   * Handle global commands that work in any flow
   */
  async handleGlobalCommands(
    text: string,
    context: FlowContext
  ): Promise<FlowResult | null> {
    const normalized = text.toLowerCase().trim();

    // Menu command
    if (['menu', 'inicio', 'voltar', 'home', '0'].includes(normalized)) {
      return mainMenuFlow.showMenu(context);
    }

    // Help command
    if (['ajuda', 'help', '?', 'socorro'].includes(normalized)) {
      return this.showHelp(context);
    }

    // Cancel command
    if (['cancelar', 'sair', 'cancel', 'exit'].includes(normalized)) {
      return mainMenuFlow.showMenu(context, 'Operacao cancelada.');
    }

    return null;
  }

  /**
   * Show help message
   */
  showHelp(context: FlowContext): FlowResult {
    return {
      messages: [
        {
          type: 'text',
          text:
            '*Ajuda - PetVet AI*\n\n' +
            'Comandos disponiveis:\n' +
            '- *menu* - Voltar ao menu principal\n' +
            '- *ajuda* - Mostrar esta mensagem\n' +
            '- *cancelar* - Cancelar operacao atual\n\n' +
            'Para iniciar uma consulta, envie "menu" e selecione "Nova Consulta".\n\n' +
            'Duvidas? Envie um email para suporte@petvet.ai',
        },
      ],
      newState: context.session.state,
    };
  }

  /**
   * Handle errors
   */
  handleError(context: FlowContext): FlowResult {
    return {
      messages: [
        {
          type: 'text',
          text:
            'Desculpe, ocorreu um erro. Por favor, tente novamente.\n\n' +
            'Digite *menu* para voltar ao inicio.',
        },
      ],
      newState: {
        ...context.session.state,
        currentFlow: 'main-menu',
        currentStep: null,
      },
    };
  }
}

export const flowEngine = new FlowEngine();
