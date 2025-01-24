class AssistantUI {
    constructor() {
        this.ws = new WebSocket('ws://localhost:3001');
        this.chatContainer = document.getElementById('chat-container');
        this.messageForm = document.getElementById('message-form');
        this.messageInput = document.getElementById('message-input');
        this.setupWebSocket();
        this.setupMessageForm();
        this.setupThemeToggle();
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        const body = document.body;
        const html = document.documentElement;

        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme') || 'light';
        body.setAttribute('data-theme', savedTheme);
        if (savedTheme === 'dark') {
            html.classList.add('dark');
        }
        themeToggle.checked = savedTheme === 'dark';

        // Theme toggle handler
        themeToggle.addEventListener('change', () => {
            const newTheme = themeToggle.checked ? 'dark' : 'light';
            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Toggle dark mode class for Tailwind
            if (newTheme === 'dark') {
                html.classList.add('dark');
            } else {
                html.classList.remove('dark');
            }
        });
    }

    setupWebSocket() {
        // Wait for connection to be established
        this.ws.addEventListener('open', () => {
            this.addSystemMessage('Connected to Assistant. How can I help you today?');
        });

        this.ws.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            console.log('Received:', data);

            // Handle the message based on its type
            if (data.type === 'response') {
                // Direct message response
                if (typeof data.content === 'string') {
                    this.addMessage('assistant', data.content);
                } 
                // Response with type and content
                else if (data.content && data.content.type) {
                    switch (data.content.type) {
                        case 'message':
                            this.addMessage('assistant', data.content.content);
                            break;
                        case 'action_result':
                            this.addMessage('assistant', data.content.content);
                            break;
                        case 'error':
                            this.addSystemMessage(`Error: ${data.content.content}`);
                            break;
                    }
                }
                this.removeTypingIndicator();
            } 
            // Error response
            else if (data.type === 'error') {
                this.addSystemMessage(`Error: ${data.content}`);
                this.removeTypingIndicator();
            }
        });

        this.ws.addEventListener('close', () => {
            this.addSystemMessage('Disconnected from Assistant. Attempting to reconnect...');
            // Try to reconnect after 3 seconds
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        });

        this.ws.addEventListener('error', () => {
            this.addSystemMessage('Connection error. Please check if the server is running.');
        });
    }

    setupMessageForm() {
        this.messageForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = this.messageInput.value.trim();
            if (message) {
                this.sendMessage(message);
                this.messageInput.value = '';
            }
        });
    }

    sendMessage(message) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.addMessage('user', message);
            this.ws.send(JSON.stringify({
                type: 'message',
                content: message
            }));
            this.showTypingIndicator();
        } else {
            this.addSystemMessage('Not connected to Assistant. Please wait for reconnection...');
        }
    }

    addMessage(role, content) {
        this.removeTypingIndicator();
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        
        messageDiv.appendChild(contentDiv);
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addSystemMessage(content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        
        messageDiv.appendChild(contentDiv);
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        this.removeTypingIndicator();
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        this.chatContainer.appendChild(indicator);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const indicator = this.chatContainer.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    scrollToBottom() {
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }
}

// Initialize the UI when the page loads
window.addEventListener('load', () => {
    new AssistantUI();
});
