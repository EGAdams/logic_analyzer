Please analyze the timing of the wave that is used as a sample in this logic analyzer:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>GPIO Data Visualization</title>
    <!-- Include Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1"></script>
    <!-- Include Luxon -->
    <script src="https://cdn.jsdelivr.net/npm/luxon@3.0.2/build/global/luxon.min.js"></script>
    <!-- Include the Luxon adapter -->
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-luxon@1.2.0"></script>
    <!-- Include the streaming plugin -->
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-streaming@2.0.0"></script>
</head>
<body>
    <h1>GPIO Pin State</h1>
    <canvas id="waveform" width="800" height="400"></canvas>
    <script>
        const ctx = document.getElementById('waveform').getContext('2d');

        // Register the streaming plugin
        Chart.register(ChartStreaming);

        // Create the chart
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'GPIO Pin State',
                    borderColor: 'rgba(75, 90, 192, 1)',
                    borderWidth: 1.2,
                    data: [],
                    parsing: false,  // Important for streaming
                    stepped: true,   // Stepped line for square transitions
                    fill: false,     // No fill under the line
                    pointRadius: 0   // Hide data point markers
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'realtime', // Realtime scale
                        realtime: {
                            duration: 20000,
                            refresh: 500,
                            delay: 500
                        },
                        time: {
                            parser: 'unix'
                        }
                    },
                    y: {
                        min: -0.5,
                        max: 1.5,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                return value;
                            }
                        }
                    }
                }
            }
        });

        // WebSocket connection
        const ws = new WebSocket('ws://localhost:8080');

        ws.onmessage = (event) => {
            // console.log('Received data:', event.data);
            const data = JSON.parse(event.data);
            chart.data.datasets[0].data.push({
                x: Date.now(),   // Use current timestamp
                y: data.value    // Use the correct property from your data
            });
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

// Mock GPIO data source (replace this with actual GPIO reading logic)
let pinState = 0; // Simulated GPIO pin state (0 or 1)

// Simulate GPIO pin updates (you can replace this with real GPIO data)
setInterval(() => {
    console.log("toggling pin state... " + pinState);
    pinState = pinState === 0 ? 1 : 0; // Toggle pin state for testing
}, 250); // Update every 500ms

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('New client connected');

    // Send data to client periodically
    const intervalId = setInterval(() => {
        const data = {
            timestamp: Date.now(),  // Use current server timestamp
            value: pinState,
        };
        console.log( data.timestamp + " " + data.value);    

        // Send data as JSON
        ws.send(JSON.stringify(data));
    }, 1000);


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

Everything seems to be working but the timing is off I think.  The square wave show show about a half second every toggle.  Now it takes it several cycles to toggle.  Please fix this.
