import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscribers = new Map();
    this.connected = false;
  }

  connect(onConnect) {
    if (this.client && this.connected) {
      console.log('WebSocket already connected');
      onConnect?.();
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      
      onConnect: () => {
        console.log('✅ WebSocket Connected');
        this.connected = true;
        onConnect?.();
      },
      
      onStompError: (frame) => {
        console.error('❌ STOMP error', frame);
        this.connected = false;
      },
      
      onWebSocketClose: () => {
        console.log('🔌 WebSocket connection closed');
        this.connected = false;
      },
      
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.activate();
  }

  subscribe(destination, callback) {
    if (!this.client) {
      console.error('WebSocket client not initialized');
      return null;
    }

    // Wait for connection if not connected
    if (!this.connected) {
      setTimeout(() => this.subscribe(destination, callback), 1000);
      return null;
    }

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        callback(message.body);
      }
    });

    this.subscribers.set(destination, subscription);
    console.log(`📡 Subscribed to: ${destination}`);
    
    return subscription;
  }

  unsubscribe(destination) {
    const subscription = this.subscribers.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscribers.delete(destination);
      console.log(`📴 Unsubscribed from: ${destination}`);
    }
  }

  unsubscribeAll() {
    this.subscribers.forEach((subscription, destination) => {
      subscription.unsubscribe();
      console.log(`📴 Unsubscribed from: ${destination}`);
    });
    this.subscribers.clear();
  }

  disconnect() {
    if (this.client) {
      this.unsubscribeAll();
      this.client.deactivate();
      this.connected = false;
      console.log('🔌 WebSocket disconnected');
    }
  }

  send(destination, data) {
    if (this.client && this.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(data),
      });
    } else {
      console.error('WebSocket not connected');
    }
  }

  isConnected() {
    return this.connected;
  }
}

export default new WebSocketService();