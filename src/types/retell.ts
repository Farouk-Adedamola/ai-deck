export interface RetellWebhookEvent {
  event: string;
  call_id: string;
  timestamp: number;
  data?: any;
}

export interface CallStartedEvent extends RetellWebhookEvent {
  event: 'call_started';
  data: {
    call_id: string;
    direction: 'inbound' | 'outbound';
    from_number?: string;
    to_number?: string;
  };
}

export interface CallEndedEvent extends RetellWebhookEvent {
  event: 'call_ended';
  data: {
    call_id: string;
    end_reason: string;
    duration: number;
  };
}

export interface FunctionCallEvent extends RetellWebhookEvent {
  event: 'function_call';
  data: {
    call_id: string;
    function_name: string;
    parameters: any;
  };
}

export interface TranscriptEvent extends RetellWebhookEvent {
  event: 'transcript';
  data: {
    call_id: string;
    transcript: string;
  };
}
