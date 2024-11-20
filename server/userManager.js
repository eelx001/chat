import { v4 as uuidv4 } from 'uuid';

class UserManager {
  constructor() {
    this.waitingUsers = new Map(); // Map<tag, Set<WebSocket>>
    this.activePairs = new Map(); // Map<WebSocket, { partner, tag, pairId }>
  }

  addWaitingUser(ws, tag) {
    if (!this.waitingUsers.has(tag)) {
      this.waitingUsers.set(tag, new Set());
    }
    this.waitingUsers.get(tag).add(ws);
  }

  removeWaitingUser(ws, tag) {
    if (this.waitingUsers.has(tag)) {
      this.waitingUsers.get(tag).delete(ws);
      if (this.waitingUsers.get(tag).size === 0) {
        this.waitingUsers.delete(tag);
      }
    }
  }

  findPair(ws, tag) {
    const waitingUsersForTag = this.waitingUsers.get(tag);
    
    if (waitingUsersForTag && waitingUsersForTag.size > 0) {
      const [partner] = waitingUsersForTag;
      waitingUsersForTag.delete(partner);
      
      const pairId = uuidv4();
      this.activePairs.set(ws, { partner, tag, pairId });
      this.activePairs.set(partner, { partner: ws, tag, pairId });
      
      return partner;
    }
    
    this.addWaitingUser(ws, tag);
    return null;
  }

  disconnectPair(ws) {
    const pair = this.activePairs.get(ws);
    if (pair) {
      this.activePairs.delete(pair.partner);
      this.activePairs.delete(ws);
      return pair;
    }
    return null;
  }

  cleanup(ws) {
    const pair = this.disconnectPair(ws);
    if (pair) {
      for (const [tag, users] of this.waitingUsers) {
        users.delete(ws);
        if (users.size === 0) {
          this.waitingUsers.delete(tag);
        }
      }
      return pair;
    }
    return null;
  }
}

export default new UserManager();