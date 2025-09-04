// pages/api/orders/notifications.js
export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to order notifications' })}\n\n`);

    // Keep connection alive with heartbeat
    const heartbeat = setInterval(() => {
        res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
    }, 30000); // Send heartbeat every 30 seconds

    // Store this connection in a global array (in production, use Redis or similar)
    if (!global.sseConnections) {
        global.sseConnections = [];
    }
    
    const connectionId = Date.now().toString();
    global.sseConnections.push({ id: connectionId, res });

    // Clean up on client disconnect
    req.on('close', () => {
        clearInterval(heartbeat);
        global.sseConnections = global.sseConnections.filter(conn => conn.id !== connectionId);
        console.log(`SSE connection ${connectionId} closed`);
    });
}