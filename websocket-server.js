const WebSocket = require('ws');

// Set up WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Mock GPIO data source (replace this with actual GPIO reading logic)
let pinState = 0; // Simulated GPIO pin state (0 or 1)

// Simulate GPIO pin updates (you can replace this with real GPIO data)
setInterval(() => {
    pinState = pinState === 0 ? 1 : 0; // Toggle pin state for testing
}, 500); // Update every 500ms

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('New client connected');

    // Send data to client periodically
    const intervalId = setInterval(() => {
        const data = {
            timestamp: Date.now(),
            value: pinState, // Replace this with the actual GPIO pin state
        };

        // Send data as JSON
        ws.send(JSON.stringify(data));
    }, 1000); // Adjust frequency as needed

    // Log incoming messages from the client
    ws.on('message', (message) => {
        console.log(`Received message from client: ${message}`);
    });

    // Clean up when the client disconnects
    ws.on('close', () => {
        console.log('Client disconnected');
        clearInterval(intervalId);
    });
});

console.log('WebSocket server is running on ws://localhost:8080');
