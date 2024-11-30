const WebSocket = require('ws');

// Set up WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Initialize an array to simulate 6 GPIO pin states
let pinStates = [0, 0, 0, 0, 0, 0]; // Simulated GPIO pin states for 6 inputs

// Simulate GPIO pin updates
setInterval(() => {
    // Randomly change each pin state
    for (let i = 0; i < pinStates.length; i++) {
        // 50% chance to toggle the pin state
        if (Math.random() < 0.5) {
            pinStates[i] = pinStates[i] === 0 ? 1 : 0;
        }
    }

    console.log("Updated pin states: " + pinStates);

    // Prepare data to send to clients
    const data = {
        timestamp: Date.now(),
        values: pinStates, // Send array of pin states
    };
    console.log(data.timestamp + " " + data.values);

    // Send data to all connected clients
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}, 250); // Update every 250ms

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('New client connected');

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
