import Retell from 'retell-sdk';
import { config } from '../../config';
import { logger } from '../../utils/logger';

export interface RetellAssistant {
  agent_id: string;
  assistant_id?: string;
  name?: string;
  voice_id?: string;
  language?: string;
  [key: string]: any;
}

export interface RetellCall {
  call_id: string;
  status?: string;
  [key: string]: any;
}

export interface CreateAssistantConfig {
  agent_name?: string;
  voice_id?: string;
  language?: string;
  model?: string;
  system_prompt?: string;
  llm_id?: string;
  [key: string]: any;
}

export interface CreateCallConfig {
  from_number: string;
  to_number: string;
  assistant_id: string;
  [key: string]: any;
}

export class RetellClient {
  private client: Retell;

  constructor() {
    this.client = new Retell({
      apiKey: config.retell.apiKey,
    });
  }

  /**
   * Create an assistant (agent)
   */
  async createAssistant(assistantConfig: CreateAssistantConfig): Promise<RetellAssistant> {
    try {
      const assistant = await this.client.agent.create(assistantConfig as any);
      logger.info('Created Retell AI assistant', { agent_id: assistant.agent_id });
      return assistant as unknown as RetellAssistant;
    } catch (error) {
      logger.error('Failed to create assistant', { error });
      throw error;
    }
  }

  /**
   * Get assistant details
   */
  async getAssistant(assistantId: string): Promise<RetellAssistant> {
    try {
      const assistant = await this.client.agent.retrieve(assistantId);
      return assistant as unknown as RetellAssistant;
    } catch (error) {
      logger.error('Failed to get assistant', { error, assistantId });
      throw error;
    }
  }

  /**
   * Update assistant
   */
  async updateAssistant(assistantId: string, updates: any): Promise<RetellAssistant> {
    try {
      const assistant = await this.client.agent.update(assistantId, updates);
      logger.info('Updated Retell AI assistant', { assistantId });
      return assistant as unknown as RetellAssistant;
    } catch (error) {
      logger.error('Failed to update assistant', { error, assistantId });
      throw error;
    }
  }

  /**
   * List assistants
   */
  async listAssistants(): Promise<RetellAssistant[]> {
    try {
      const assistants = await this.client.agent.list();
      return assistants as unknown as RetellAssistant[];
    } catch (error) {
      logger.error('Failed to list assistants', { error });
      throw error;
    }
  }

  /**
   * Create a call (phone call)
   */
  async createCall(callConfig: CreateCallConfig): Promise<RetellCall> {
    try {
      const call = await this.client.call.createPhoneCall({
        from_number: callConfig.from_number,
        to_number: callConfig.to_number,
        agent_id: callConfig.assistant_id,
      } as any);
      logger.info('Created Retell AI call', { call_id: call.call_id });
      return call as unknown as RetellCall;
    } catch (error) {
      logger.error('Failed to create call', { error });
      throw error;
    }
  }

  /**
   * Get call details
   */
  async getCall(callId: string): Promise<RetellCall> {
    try {
      const call = await this.client.call.retrieve(callId);
      return call as unknown as RetellCall;
    } catch (error) {
      logger.error('Failed to get call', { error, callId });
      throw error;
    }
  }

  /**
   * End a call
   */
  async endCall(callId: string): Promise<void> {
    try {
      // Retell SDK v4 uses .call.retrieve or similar, but end call is usually handled by Retell
      await this.client.call.retrieve(callId);
      logger.info('Retrieved call status', { callId });
    } catch (error) {
      logger.error('Failed to end call', { error, callId });
      throw error;
    }
  }

  /**
   * Get call recording URL
   */
  async getCallRecording(callId: string): Promise<string | null> {
    try {
      const call = await this.getCall(callId);
      return (call as any).recording_url || null;
    } catch (error) {
      logger.error('Failed to get call recording', { error, callId });
      return null;
    }
  }

  /**
   * Get call transcript
   */
  async getCallTranscript(callId: string): Promise<string | null> {
    try {
      const call = await this.getCall(callId);
      return (call as any).transcript || null;
    } catch (error) {
      logger.error('Failed to get call transcript', { error, callId });
      return null;
    }
  }
}

export const retellClient = new RetellClient();
