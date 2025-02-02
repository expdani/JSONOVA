export interface Theme {
  colors: {
    background: string;
    text: string;
    primary: string;
  };
}

export interface Message {
  role: 'system' | 'assistant' | 'user';
  content: string;
}

export interface WebSocketMessage {
  type: 'response' | 'error' | 'alarm';
  message?: string;
  content: string | {
    message?: string;
    type: 'message' | 'error' | 'action_result';
    content: string;
  };
}

export interface WebSocketRequest {
  type: string;
  content: string;
}
