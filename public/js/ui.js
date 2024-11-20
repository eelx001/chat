export class UI {
  constructor() {
    this.elements = {
      tagSelection: document.getElementById('tag-selection'),
      chatContainer: document.getElementById('chat-container'),
      messages: document.getElementById('messages'),
      messageForm: document.getElementById('message-form'),
      messageInput: document.getElementById('message-input'),
      skipBtn: document.getElementById('skip-btn'),
      changeTagBtn: document.getElementById('change-tag-btn'),
      status: document.getElementById('status'),
      typingIndicator: document.getElementById('typing-indicator'),
      currentTag: document.querySelector('.current-tag')
    };

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.elements.changeTagBtn.addEventListener('click', () => {
      this.showTagSelection();
    });
  }

  updateStatus(message, className) {
    this.elements.status.textContent = message;
    this.elements.status.className = 'status ' + className;
  }

  addSystemMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('system-message');
    messageElement.textContent = text;
    this.elements.messages.appendChild(messageElement);
    this.scrollToBottom();
  }

  addMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', message.sender === 'stranger' ? 'received' : 'sent');
    messageElement.textContent = message.text;
    this.elements.messages.appendChild(messageElement);
    this.scrollToBottom();
  }

  scrollToBottom() {
    this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
  }

  showChat(tag) {
    this.elements.tagSelection.classList.add('hidden');
    this.elements.chatContainer.classList.remove('hidden');
    this.elements.currentTag.textContent = `#${tag}`;
    this.clearChat();
  }

  showTagSelection() {
    this.elements.tagSelection.classList.remove('hidden');
    this.elements.chatContainer.classList.add('hidden');
  }

  clearChat() {
    this.elements.messages.innerHTML = '';
    this.elements.messageInput.value = '';
    this.elements.typingIndicator.classList.add('hidden');
  }

  setInputState(enabled) {
    this.elements.messageInput.disabled = !enabled;
    this.elements.skipBtn.disabled = !enabled;
  }

  toggleTypingIndicator(show) {
    this.elements.typingIndicator.classList.toggle('hidden', !show);
  }
}

export default new UI();