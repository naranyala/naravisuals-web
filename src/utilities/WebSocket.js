// WebSocket manager with reconnection and message queuing
const WebSocketManager = (() => {
  return class WebSocketManager {
    constructor(url, options = {}) {
      this.url = url;
      this.options = {
        reconnect: true,
        maxReconnectAttempts: 5,
        reconnectInterval: 3000,
        messageQueue: true,
        ...options
      };
      
      this.ws = null;
      this.reconnectAttempts = 0;
      this.messageQueue = [];
      this.listeners = new Map();
      this.isConnected = false;
      
      this.connect();
    }

    connect() {
      try {
        this.ws = new WebSocket(this.url);
        this.setupEventHandlers();
      } catch (error) {
        this.handleError(error);
      }
    }

    setupEventHandlers() {
      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('open');
        this.processQueue();
      };

      this.ws.onmessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          data = event.data;
        }
        this.emit('message', data);
      };

      this.ws.onclose = (event) => {
        this.isConnected = false;
        this.emit('close', event);
        
        if (this.options.reconnect && this.reconnectAttempts < this.options.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
          }, this.options.reconnectInterval);
        }
      };

      this.ws.onerror = (error) => {
        this.emit('error', error);
      };
    }

    send(data, queueIfDisconnected = true) {
      if (this.isConnected) {
        const message = typeof data === 'string' ? data : JSON.stringify(data);
        this.ws.send(message);
      } else if (queueIfDisconnected && this.options.messageQueue) {
        this.messageQueue.push(data);
      }
    }

    processQueue() {
      while (this.messageQueue.length > 0 && this.isConnected) {
        this.send(this.messageQueue.shift(), false);
      }
    }

    on(event, callback) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, new Set());
      }
      this.listeners.get(event).add(callback);
    }

    off(event, callback) {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
      }
    }

    emit(event, data) {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.forEach(callback => callback(data));
      }
    }

    close(code = 1000, reason = '') {
      this.options.reconnect = false;
      if (this.ws) {
        this.ws.close(code, reason);
      }
    }

    // Utility methods
    ping() {
      this.send({ type: 'ping', timestamp: Date.now() });
    }

    subscribe(channel) {
      this.send({ type: 'subscribe', channel });
    }

    unsubscribe(channel) {
      this.send({ type: 'unsubscribe', channel });
    }
  };
})();
