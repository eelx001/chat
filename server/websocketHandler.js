import { v4 as uuidv4 } from 'uuid';
import userManager from './userManager.js';

export function handleWebSocket(ws) {
  ws.id = uuidv4();
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      handleMessage(ws, message);
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  ws.on('close', () => handleClose(ws));
}

function handleMessage(ws, message) {
  switch (message.type) {
    case 'join':
      handleJoin(ws, message.tag);
      break;
    case 'chat':
      handleChat(ws, message);
      break;
    case 'typing':
      handleTyping(ws, message);
      break;
    case 'skip':
      handleSkip(ws);
      break;
  }
}

function handleJoin(ws, tag) {
  const partner = userManager.findPair(ws, tag);
  
  if (partner) {
    const pair = userManager.activePairs.get(ws);
    const pairMessage = JSON.stringify({ 
      type: 'paired', 
      pairId: pair.pairId,
      tag: pair.tag 
    });
    
    ws.send(pairMessage);
    partner.send(pairMessage);
  } else {
    ws.send(JSON.stringify({ type: 'waiting', tag }));
  }
}

function handleChat(ws, message) {
  const pair = userManager.activePairs.get(ws);
  if (pair) {
    pair.partner.send(JSON.stringify({
      type: 'chat',
      text: message.text,
      sender: 'stranger'
    }));
  }
}

function handleTyping(ws, message) {
  const pair = userManager.activePairs.get(ws);
  if (pair) {
    pair.partner.send(JSON.stringify({ 
      type: 'typing', 
      isTyping: message.isTyping 
    }));
  }
}

function handleSkip(ws) {
  const pair = userManager.disconnectPair(ws);
  if (pair) {
    ws.send(JSON.stringify({ type: 'disconnected' }));
    pair.partner.send(JSON.stringify({ type: 'disconnected' }));
  }
}

function handleClose(ws) {
  const pair = userManager.cleanup(ws);
  if (pair) {
    pair.partner.send(JSON.stringify({ type: 'disconnected' }));
  }
}