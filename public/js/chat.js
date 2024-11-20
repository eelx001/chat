export class Chat {
  constructor(ui) {
    this.ui = ui;
    this.ws = null;
    this.currentTag = null;
    this.typingTimeout = null;
  }

  connect(tag) {
    if (this.ws) {
      this.ws.close();
    }

    this.currentTag = tag;
    this.ws = new WebSocket(`wss://${window.location.host}`);
    this.setupWebSocket();
    this.ui.showChat(tag);
  }

  setupWebSocket() {
    this.ws.onopen = () => {
      this.ui.updateStatus('Connecting...', 'connecting');
      this.ws.send(JSON.stringify({ type: 'join', tag: this.currentTag }));
    };

    this.ws.onmessage = (event) => this.handleMessage(JSON.parse(event.data));
    
    this.ws.onclose = () => {
      this.ui.updateStatus('Disconnected', 'connecting');
      this.ui.addSystemMessage('Connection lost. Please refresh the page.');
      this.ui.setInputState(false);
    };
  }

  handleMessage(data) {
    switch (data.type) {
      case 'waiting':
        this.ui.updateStatus('Looking for a partner...', 'waiting');
        this.ui.addSystemMessage('Waiting for someone to connect...');
        break;
        
      case 'paired':
        this.ui.updateStatus('Connected', 'connected');
        this.ui.clearChat();
        this.ui.addSystemMessage('You\'re now chatting with a stranger!');
        this.ui.setInputState(true);
        break;
        
      case 'chat':
        this.ui.addMessage(data);
        break;
        
      case 'typing':
        this.ui.toggleTypingIndicator(data.isTyping);
        break;
        
      case 'disconnected':
        this.ui.updateStatus('Disconnected', 'connecting');
        this.ui.addSystemMessage('Your chat partner has disconnected.');
        this.ui.toggleTypingIndicator(false);
        this.ui.setInputState(false);
        break;
    }
  }

  sendMessage(text) {
    if (text.trim()) {
      this.ws.send(JSON.stringify({ type: 'chat', text }));
      this.ui.addMessage({ text, sender: 'self' });
      this.sendTypingStatus(false);
    }
  }

  sendTypingStatus(isTyping) {
    this.ws.send(JSON.stringify({ type: 'typing', isTyping }));
  }

  skip() {
    this.ws.send(JSON.stringify({ type: 'skip' }));
    this.ui.clearChat();
    this.ui.addSystemMessage('Finding a new chat partner...');
    this.ui.updateStatus('Connecting...', 'connecting');
  }
}

export default Chat;
