/* eslint-disable import/no-anonymous-default-export */
// Store Front App: /lib/websocket-client.js
import io from 'socket.io-client';

class WebSocketClient {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    connect(inventoryAppUrl) {
        if (this.socket) {
            this.disconnect();
        }

        this.socket = io(inventoryAppUrl, {
            transports: ['websocket'],
            timeout: 10000,
            forceNew: true
        });

        this.socket.on('connect', () => {
            console.log('Connected to inventory app WebSocket');
            this.isConnected = true;
            this.reconnectAttempts = 0;
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from inventory app WebSocket');
            this.isConnected = false;
            this.handleReconnect(inventoryAppUrl);
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            this.isConnected = false;
            this.handleReconnect(inventoryAppUrl);
        });

        return this.socket;
    }

    handleReconnect(inventoryAppUrl) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

            setTimeout(() => {
                this.connect(inventoryAppUrl);
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    subscribeToOrderUpdates(userId, callback) {
        if (!this.socket) return;

        this.socket.emit('subscribe-user-orders', userId);
        this.socket.on('order-status-updated', callback);
    }

    unsubscribeFromOrderUpdates() {
        if (!this.socket) return;

        this.socket.off('order-status-updated');
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    isConnectedToServer() {
        return this.isConnected && this.socket?.connected;
    }
}

export default new WebSocketClient();