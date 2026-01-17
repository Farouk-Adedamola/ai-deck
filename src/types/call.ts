export interface Call {
  id: string;
  retell_call_id: string;
  direction: 'inbound' | 'outbound';
  phone_number?: string;
  customer_name?: string;
  customer_email?: string;
  status: string;
  assistant_id?: string;
  started_at?: Date;
  ended_at?: Date;
  duration?: number;
  recording_url?: string;
  transcript?: string;
  summary?: string;
  handoff_requested: boolean;
  handoff_reason?: string;
  nkiru_ticket_id?: string;
  nkiru_ticket_number?: string;
  client_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCallData {
  phone_number: string;
  customer_name?: string;
  customer_email?: string;
  direction: 'inbound' | 'outbound';
}
