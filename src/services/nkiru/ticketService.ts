import { nkiruClient } from './nkiruClient';
import { logger } from '../../utils/logger';

export interface CreateTicketData {
  customerName: string;
  email: string;
  phoneNumber: string;
  subject: string;
  description: string;
  category: string;
  fileKey?: string;
  uploadedFile?: string;
}

export interface Ticket {
  _id: string;
  ticketId: string;
  clientId: string;
  customerName: string;
  email: string;
  phoneNumber: string;
  subject: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
}

export class TicketService {
  /**
   * Create a ticket in NKIRU
   */
  async createTicket(data: CreateTicketData): Promise<Ticket> {
    try {
      const ticket = await nkiruClient.post<Ticket>('/tickets/create', data);
      logger.info('Created ticket in NKIRU', { ticketId: ticket.ticketId, _id: ticket._id });
      return ticket;
    } catch (error) {
      logger.error('Failed to create ticket in NKIRU', { error, data });
      throw error;
    }
  }

  /**
   * Add a comment to a ticket
   */
  async addComment(ticketId: string, comment: string): Promise<void> {
    try {
      await nkiruClient.post(`/tickets/add/comment/${ticketId}`, { comment });
      logger.info('Added comment to ticket', { ticketId });
    } catch (error) {
      logger.error('Failed to add comment to ticket', { error, ticketId });
      throw error;
    }
  }

  /**
   * Get ticket details
   */
  async getTicket(ticketId: string): Promise<Ticket> {
    try {
      const ticket = await nkiruClient.get<Ticket>(`/tickets/${ticketId}`);
      return ticket;
    } catch (error) {
      logger.error('Failed to get ticket', { error, ticketId });
      throw error;
    }
  }

  /**
   * Close a ticket
   */
  async closeTicket(ticketId: string): Promise<void> {
    try {
      await nkiruClient.post(`/tickets/close/${ticketId}`);
      logger.info('Closed ticket', { ticketId });
    } catch (error) {
      logger.error('Failed to close ticket', { error, ticketId });
      throw error;
    }
  }
}

export const ticketService = new TicketService();
