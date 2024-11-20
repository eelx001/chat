import UI from './ui.js';
import Chat from './chat.js';

const chat = new Chat(UI);

// Interest form
document.getElementById('interest-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const interestInput = document.getElementById('interest-input');
  const interest = interestInput.value.trim().toLowerCase();
  
  if (interest) {
    chat.connect(interest);
    interestInput.value = '';
  }
});

// Message form
UI.elements.messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = UI.elements.messageInput.value.trim();
  if (text) {
    chat.sendMessage(text);
    UI.elements.messageInput.value = '';
  }
});

// Typing indicator
UI.elements.messageInput.addEventListener('input', () => {
  clearTimeout(chat.typingTimeout);
  chat.sendTypingStatus(true);
  
  chat.typingTimeout = setTimeout(() => {
    chat.sendTypingStatus(false);
  }, 1000);
});

// Skip button
UI.elements.skipBtn.addEventListener('click', () => {
  chat.skip();
});