// Store Front App: /hooks/useWebSocket.js
import { useEffect, useRef, useState } from 'react';
import WebSocketClient from '../lib/websocket-client';

export const useWebSocket = (inventoryAppUrl, userId) => {
    const [isConnected, setIsConnected] = useState(false);
    const [orders, setOrders] = useState([]);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!inventoryAppUrl || !userId) return;

        // Connect to WebSocket
        socketRef.current = WebSocketClient.connect(inventoryAppUrl);

        // Listen for connection status
        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);

        socketRef.current.on('connect', handleConnect);
        socketRef.current.on('disconnect', handleDisconnect);

        // Subscribe to order updates for this user
        WebSocketClient.subscribeToOrderUpdates(userId, (updatedOrder) => {
            setOrders(prevOrders => {
                const orderIndex = prevOrders.findIndex(order => order.id === updatedOrder.id);
                if (orderIndex >= 0) {
                    // Update existing order
                    const newOrders = [...prevOrders];
                    newOrders[orderIndex] = { ...newOrders[orderIndex], ...updatedOrder };
                    return newOrders;
                }
                return prevOrders;
            });
        });

        return () => {
            WebSocketClient.unsubscribeFromOrderUpdates();
            socketRef.current?.off('connect', handleConnect);
            socketRef.current?.off('disconnect', handleDisconnect);
            WebSocketClient.disconnect();
        };
    }, [inventoryAppUrl, userId]);

    const updateOrdersState = (newOrders) => {
        setOrders(newOrders);
    };

    return {
        isConnected,
        orders,
        updateOrdersState
    };
};