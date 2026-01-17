export interface NKIRUFAQ {
  _id: string;
  clientId: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

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
