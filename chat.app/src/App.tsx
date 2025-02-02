import { useState, useEffect, useCallback, useRef } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Message, WebSocketMessage, WebSocketRequest } from './types';
import {
  AppContainer,
  Header,
  ChatContainer,
  Form,
  Input,
  Button
} from './styles';
import MessageBubble from './components/MessageBubble';
import ThemeToggle from './components/ThemeToggle';

const WS_URL = 'ws://localhost:3002';

const App = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // WebSocket setup with proper error handling
  const { sendMessage, lastMessage, readyState } = useWebSocket(WS_URL, {
    shouldReconnect: () => true,
    reconnectAttempts: 3,
    reconnectInterval: 3000,
  });

  // Message handlers
  const addMessage = useCallback((role: Message['role'], content: string) => {
    setMessages(prev => [...prev, { role, content }]);
  }, []);

  const addSystemMessage = useCallback((content: string) => {
    addMessage('system', content);
  }, [addMessage]);

  // WebSocket connection status handler
  useEffect(() => {
    const connectionStatus = {
      [ReadyState.CONNECTING]: 'Connecting to Assistant...',
      [ReadyState.OPEN]: 'Connected to Assistant. How can I help you today?',
      [ReadyState.CLOSING]: 'Disconnecting from Assistant...',
      [ReadyState.CLOSED]: 'Disconnected from Assistant. Attempting to reconnect...',
      [ReadyState.UNINSTANTIATED]: 'Connection uninstantiated',
    };
    
    addSystemMessage(connectionStatus[readyState]);
  }, [readyState, addSystemMessage]);

  // Message handler for incoming WebSocket messages
  const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
    switch (data.type) {
      case 'response': {
        if (typeof data.content === 'string') {
          addMessage('assistant', data.content);
          return;
        }

        switch (data.content.type) {
          case 'message':
            addMessage('assistant', data.content.content);
            break;
          case 'error':
            addSystemMessage(data.content.message ?? 'An error occurred');
            break;
          case 'action_result':
            addMessage('assistant', data.content.content);
            break;
        }
        break;
      }
      case 'error':
        addSystemMessage(data.message || 'An error occurred');
        break;
      case 'alarm': {
        const content = typeof data.content === 'string'
          ? data.content
          : data.content.content;
        if (audioRef.current) {
          audioRef.current.play().catch(console.error);
        }
        addSystemMessage(`🔔 ${content}`);
        break;
      }
    }
  }, [addMessage, addSystemMessage]);

  // Process incoming WebSocket messages
  useEffect(() => {
    if (!lastMessage?.data) return;

    try {
      const rawData = lastMessage.data;
      const data = typeof rawData === 'string' 
        ? JSON.parse(rawData) as WebSocketMessage
        : rawData as WebSocketMessage;
      
      handleWebSocketMessage(data);
    } catch (error) {
      console.error('Failed to parse message:', error);
      addSystemMessage('Failed to parse message from server');
    }
  }, [lastMessage, handleWebSocketMessage, addSystemMessage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Message submission handler
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const request: WebSocketRequest = {
      type: 'message',
      content: messageInput
    };

    addMessage('user', messageInput);
    sendMessage(JSON.stringify(request));
    setMessageInput('');
  }, [messageInput, sendMessage, addMessage]);

  return (
    <AppContainer>
      <Header>
        <h1>jsoNova</h1>
        <ThemeToggle />
      </Header>

      <ChatContainer>
        {messages.map((message, index) => (
          <MessageBubble key={index} role={message.role}>
            {message.content}
          </MessageBubble>
        ))}
        <div ref={messagesEndRef} />
      </ChatContainer>

      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          value={messageInput}
          onChange={(e) => {
            setMessageInput(e.target.value);
          }}
          placeholder="Type your message..."
        />
        <Button type="submit">Send</Button>
      </Form>

      <audio ref={audioRef} src="/notification.mp3" />
    </AppContainer>
  );
};

export default App;
