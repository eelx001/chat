const ws = new WebSocket(`ws://${window.location.host}`);
const messages = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const skipBtn = document.getElementById('skip-btn');
const status = document.getElementById('status');
const typingIndicator = document.getElementById('typing-indicator');

let typingTimeout;

function updateStatus(message, className) {
    status.textContent = message;
    status.className = 'status ' + className;
}

function addSystemMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('system-message');
    messageElement.textContent = text;
    messages.appendChild(messageElement);
    messages.scrollTop = messages.scrollHeight;
}

function addMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', message.sender === 'stranger' ? 'received' : 'sent');
    messageElement.textContent = message.text;
    messages.appendChild(messageElement);
    messages.scrollTop = messages.scrollHeight;
}

messageInput.addEventListener('input', () => {
    clearTimeout(typingTimeout);
    ws.send(JSON.stringify({ type: 'typing', isTyping: true }));
    
    typingTimeout = setTimeout(() => {
        ws.send(JSON.stringify({ type: 'typing', isTyping: false }));
    }, 1000);
});

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    
    if (text) {
        const message = { type: 'chat', text };
        ws.send(JSON.stringify(message));
        addMessage({ text, sender: 'self' });
        messageInput.value = '';
        // Clear typing indicator
        ws.send(JSON.stringify({ type: 'typing', isTyping: false }));
    }
});

skipBtn.addEventListener('click', () => {
    ws.send(JSON.stringify({ type: 'skip' }));
    messages.innerHTML = '';
    addSystemMessage('Finding a new chat partner...');
    updateStatus('Connecting...', 'connecting');
});

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    switch (data.type) {
        case 'waiting':
            updateStatus('Looking for a partner...', 'waiting');
            addSystemMessage('Waiting for someone to connect...');
            break;
            
        case 'paired':
            updateStatus('Connected', 'connected');
            messages.innerHTML = '';
            addSystemMessage('You\'re now chatting with a stranger!');
            messageInput.disabled = false;
            skipBtn.disabled = false;
            break;
            
        case 'chat':
            addMessage(data);
            break;
            
        case 'typing':
            typingIndicator.classList.toggle('hidden', !data.isTyping);
            break;
            
        case 'disconnected':
            updateStatus('Disconnected', 'connecting');
            addSystemMessage('Your chat partner has disconnected.');
            typingIndicator.classList.add('hidden');
            messageInput.disabled = true;
            skipBtn.disabled = true;
            break;
    }
};

ws.onopen = () => {
    updateStatus('Connecting...', 'connecting');
};

ws.onclose = () => {
    updateStatus('Disconnected', 'connecting');
    addSystemMessage('Connection lost. Please refresh the page.');
    messageInput.disabled = true;
    skipBtn.disabled = true;
};