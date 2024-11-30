const WebSocket = require('ws');

// Set up WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Mock GPIO data source (replace this with actual GPIO reading logic)
let pinState = 0; // Simulated GPIO pin state (0 or 1)

// Simulate GPIO pin updates (you can replace this with real GPIO data)
setInterval(() => {
    pinState = pinState === 0 ? 1 : 0; // Toggle pin state for testing
    console.log("Toggling pin state... " + pinState);

    // Send data to all connected clients immediately after state change
    const data = {
        timestamp: Date.now(),
        value: pinState,
    };
    console.log(data.timestamp + " " + data.value);

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}, 250); // Update every 250ms

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('New client connected');

    // No need for an additional interval here since we're sending data on state change

    // Log incoming messages from the client
    ws.on('message', (message) => {
        console.log(`Received message from client: ${message}`);
    });

    // Clean up when the client disconnects
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server is running on ws://localhost:8080');
