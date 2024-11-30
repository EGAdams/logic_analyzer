On this HTML page, the "received data" log is getting called, so I know the web socket is working.
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GPIO Data Visualization</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-streaming"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns"></script>
</head>
<body>
    <h1>GPIO Pins State</h1>
    <canvas id="waveform" width="800" height="600"></canvas>
    <script>
        const ctx = document.getElementById('waveform').getContext('2d');
        Chart.register(ChartStreaming);

        // Create datasets for 6 signals with different colors
        const datasets = [
            { label: 'GPIO Pin 1', borderColor: 'rgba(255, 99, 132, 1)', data: [] },
            { label: 'GPIO Pin 2', borderColor: 'rgba(54, 162, 235, 1)', data: [] },
            { label: 'GPIO Pin 3', borderColor: 'rgba(255, 206, 86, 1)', data: [] },
            { label: 'GPIO Pin 4', borderColor: 'rgba(75, 192, 192, 1)', data: [] },
            { label: 'GPIO Pin 5', borderColor: 'rgba(153, 102, 255, 1)', data: [] },
            { label: 'GPIO Pin 6', borderColor: 'rgba(255, 159, 64, 1)', data: [] }
        ];

        const chart = new Chart(ctx, {
            type: 'line',
            data: { datasets },
            options: {
                plugins: {
                    streaming: {
                        duration: 20000,
                        refresh: 100,
                        delay: 1000
                    }
                },
                scales: {
                    x: {
                        type: 'realtime',
                        realtime: {
                            duration: 20000,
                            refresh: 100,
                            delay: 1000
                        }
                    },
                    y: {
                        min: -0.5,
                        max: 1.5,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                elements: {
                    line: {
                        tension: 0 // Disable bezier curves for sharp transitions
                    }
                }
            }
        });

        const ws = new WebSocket('ws://localhost:8080');

        ws.onmessage = (event) => {
            console.log("Received data:", event.data);
            const data = JSON.parse(event.data);
            const timestamp = Date.now();
            
            // Update all 6 signals
            if (data.values && Array.isArray(data.values)) {
                data.values.forEach((value, index) => {
                    chart.data.datasets[index].data.push({
                        x: timestamp,
                        y: value
                    });
                });
            }
        };
    </script>
</body>
</html>
```

Here is the websocket server code.  It is working, I just want to show it to you for reference.
```javascript
const WebSocket = require('ws');

// Set up WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Mock 6 GPIO data sources
let pinStates = [0, 0, 0, 0, 0, 0]; // 6 simulated GPIO pin states

// Simulate different toggle patterns for each pin
setInterval(() => {
    pinStates[0] = pinStates[0] === 0 ? 1 : 0; // Toggle every ~450ms
}, 453);

setInterval(() => {
    pinStates[1] = pinStates[1] === 0 ? 1 : 0; // Toggle every ~800ms
}, 817);

setInterval(() => {
    pinStates[2] = pinStates[2] === 0 ? 1 : 0; // Toggle every ~1200ms
}, 1223);

setInterval(() => {
    pinStates[3] = pinStates[3] === 0 ? 1 : 0; // Toggle every ~600ms
}, 637);

setInterval(() => {
    pinStates[4] = pinStates[4] === 0 ? 1 : 0; // Toggle every ~900ms
}, 931);

setInterval(() => {
    pinStates[5] = pinStates[5] === 0 ? 1 : 0; // Toggle every ~1500ms
}, 1531);

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('New client connected');

    // Send data to client periodically
    const intervalId = setInterval(() => {
        const data = {
            timestamp: Date.now(),
            values: pinStates // Send all pin states
        };

        // Send data as JSON
        console.log(`Sending data to client: ${JSON.stringify(data)}`);
        ws.send(JSON.stringify(data));
    }, 100); // Update every 100ms

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
```

The chart on the HTML page is scrolling from left to right, but it is not showing any data.
Please fix it.