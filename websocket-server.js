const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('New client connected');

    // Example: Sending a message to the client every second
    setInterval(() => {
        const mockData = Math.random() > 0.5 ? 1 : 0; // Example square wave
        ws.send(JSON.stringify({ timestamp: Date.now(), value: mockData }));
    }, 1000);

    ws.on('message', (message) => {
        console.log(`Received message from client: ${message}`);
    });
});

console.log('WebSocket server is running on ws://localhost:8080');
