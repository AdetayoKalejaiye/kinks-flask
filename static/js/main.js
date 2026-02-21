// Kinks AI Assistant - Main JavaScript

class KinksChat {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.chatForm = document.getElementById('chatForm');
        this.sendButton = document.getElementById('sendButton');
        this.clearChatButton = document.getElementById('clearChatButton');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.kinksCharacter = document.getElementById('kinks-character');
        this.kinksImage = document.getElementById('kinks-image');
        
        this.messages = this.loadChatHistory();
        this.currentPose = 'neutral';
        this.isLoading = false;
        this.turnstileToken = null;
        
        this.init();
    }

    init() {
        // Event listeners
        this.chatForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.clearChatButton.addEventListener('click', () => this.clearChat());
        
        // Start idle animation
        this.startIdleAnimation();
        
        // Load existing messages
        this.renderMessages();
    }

    startIdleAnimation() {
        this.kinksCharacter.classList.add('idle');
    }

    stopIdleAnimation() {
        this.kinksCharacter.classList.remove('idle');
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Add user message
        this.addMessage('user', message);
        this.messageInput.value = '';
        
        // Show loading
        this.setLoading(true);
        this.stopIdleAnimation();

        try {
            // Prepare chat history
            const history = this.messages.map(msg => ({
                role: msg.role === 'assistant' ? 'kinks' : msg.role,
                content: msg.content
            }));

            // Call API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: message,
                    history: history.slice(0, -1), // Exclude the message we just added
                    cf_turnstile_token: this.turnstileToken
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response from server');
            }

            const data = await response.json();
            
            // Update character pose based on sentiment
            this.updatePose(data.sentiment || 'neutral');
            
            // Add assistant message
            this.addMessage('assistant', data.response);

        } catch (error) {
            console.error('Error:', error);
            this.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
            this.updatePose('sad');
        } finally {
            this.setLoading(false);
            setTimeout(() => this.startIdleAnimation(), 3000);
        }
    }

    addMessage(role, content) {
        const message = { role, content, timestamp: Date.now() };
        this.messages.push(message);
        this.saveChatHistory();
        this.renderMessage(message);
        this.scrollToBottom();
    }

    renderMessages() {
        // Clear existing messages except welcome message
        while (this.chatMessages.children.length > 1) {
            this.chatMessages.removeChild(this.chatMessages.lastChild);
        }
        
        // Render all messages
        this.messages.forEach(msg => this.renderMessage(msg));
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.role}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const p = document.createElement('p');
        p.textContent = message.content;
        
        contentDiv.appendChild(p);
        messageDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(messageDiv);
    }

    updatePose(sentiment) {
        if (this.currentPose === sentiment) return;
        
        this.currentPose = sentiment;
        
        // Trigger pose change animation
        this.kinksCharacter.style.animation = 'poseChange 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        
        // Update image
        setTimeout(() => {
            this.kinksImage.src = `/static/images/poses/${sentiment}.png`;
            this.kinksCharacter.setAttribute('data-pose', sentiment);
        }, 300);
        
        // Reset animation
        setTimeout(() => {
            this.kinksCharacter.style.animation = '';
        }, 600);
    }

    setLoading(loading) {
        this.isLoading = loading;
        this.sendButton.disabled = loading;
        this.messageInput.disabled = loading;
        this.loadingIndicator.style.display = loading ? 'block' : 'none';
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    clearChat() {
        if (!confirm('Are you sure you want to clear all chat messages? This cannot be undone.')) {
            return;
        }
        
        this.messages = [];
        this.saveChatHistory();
        this.renderMessages();
        this.updatePose('neutral');
    }

    loadChatHistory() {
        try {
            const stored = localStorage.getItem('kinks_chat_history');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading chat history:', error);
            return [];
        }
    }

    saveChatHistory() {
        try {
            localStorage.setItem('kinks_chat_history', JSON.stringify(this.messages));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }
}
function onTurnstileSuccess(token) {
    if (window.kinksChat) {
        window.kinksChat.turnstileToken = token;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.kinksChat =document.addEventListener('DOMContentLoaded', () => {
    new KinksChat();
})});
