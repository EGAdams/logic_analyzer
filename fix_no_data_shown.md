On this HTML page, the "received data" log is getting called, so I know the web socket is working.
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>GPIO Data Visualization</title>
    <!-- Include Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1"></script>
    <!-- Include date-fns library -->
    <script src="https://cdn.jsdelivr.net/npm/date-fns@2.29.3/dist/date-fns.min.js"></script>
    <!-- Include the date-fns adapter -->
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@2.0.0"></script>
    <!-- Include the streaming plugin -->
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-streaming@2.0.0"></script>
</head>
<body>
    <h1>GPIO Pin State</h1>
    <canvas id="waveform" width="800" height="400"></canvas>
    <script>
        const ctx = document.getElementById('waveform').getContext('2d');

        // Register streaming plugin using the correct variable
        Chart.register(ChartStreaming);

        // Create the chart
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'GPIO Pin State',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    data: [],
                    parsing: false  // Important for streaming
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
                        }
                    },
                    y: {
                        min: -0.5,
                        max: 1.5
                    }
                }
            }
        });

        // WebSocket connection
        const ws = new WebSocket('ws://localhost:8080');

        ws.onmessage = (event) => {
            console.log('Received data:', event.data);
            const data = JSON.parse(event.data);
            chart.data.datasets[0].data.push({
                x: Date.now(),   // Use current timestamp
                y: data.value    // Corrected from data.state
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
```

The chart on the HTML page is scrolling from left to right, but it is not showing any data.
It's almost as if the data is drawing white on a white background.  Please find out why this is hapening.
I can see the data in the console, so I know the websocket is working.  Here is some sample data from the google chrome developer console output:
```
(index):60 Received data: {"timestamp":1732934644550,"value":0}
21:44:04.768 (index):60 Received data: {"timestamp":1732934644800,"value":1}
21:44:04.970 (index):60 Received data: {"timestamp":1732934645051,"value":1}
21:44:05.226 (index):60 Received data: {"timestamp":1732934645302,"value":0}
21:44:05.478 (index):60 Received data: {"timestamp":1732934645552,"value":1}
21:44:05.732 (index):60 Received data: {"timestamp":1732934645802,"value":1}
21:44:05.986 (index):60 Received data: {"timestamp":1732934646052,"value":1}
21:44:06.239 (index):60 Received data: {"timestamp":1732934646302,"value":0}
21:44:06.493 (index):60 Received data: {"timestamp":1732934646552,"value":1}
21:44:06.747 (index):60 Received data: {"timestamp":1732934646803,"value":0}
21:44:07.002 (index):60 Received data: {"timestamp":1732934647054,"value":1}
21:44:07.254 (index):60 Received data: {"timestamp":1732934647303,"value":1}
21:44:07.509 (index):60 Received data: {"timestamp":1732934647554,"value":1}
21:44:07.762 (index):60 Received data: {"timestamp":1732934647803,"value":1}
21:44:08.016 (index):60 Received data: {"timestamp":1732934648054,"value":1}
21:44:08.276 (index):60 Received data: {"timestamp":1732934648304,"value":0}
21:44:08.524 (index):60 Received data: {"timestamp":1732934648554,"value":1}
```

Yet there is no data on the chart.


# Error messages:
These error messages are from the browser console.  They are repeaing over and over again.
```
chartjs-adapter-date-fns@2.0.0:7 Uncaught TypeError: Cannot read properties of undefined (reading 'startOfDay')
    at vn.startOf (chartjs-adapter-date-fns@2.0.0:7:1876)
    at w.determineDataLimits (chart.js@3.9.1:13:185525)
    at w.update (chart.js@3.9.1:13:63316)
    at w.update (chartjs-plugin-streaming@2.0.0:7:8205)
    at qi (chart.js@3.9.1:13:35179)
    at Object.update (chart.js@3.9.1:13:37572)
    at bn._updateLayout (chart.js@3.9.1:13:93740)
    at bn.update (chart.js@3.9.1:13:92568)
    at chartjs-plugin-streaming@2.0.0:7:6945
    at Object.c [as callback] (chart.js@3.9.1:7:911)
startOf @ chartjs-adapter-date-fns@2.0.0:7
determineDataLimits @ chart.js@3.9.1:13
update @ chart.js@3.9.1:13
update @ chartjs-plugin-streaming@2.0.0:7
qi @ chart.js@3.9.1:13
update @ chart.js@3.9.1:13
_updateLayout @ chart.js@3.9.1:13
update @ chart.js@3.9.1:13
(anonymous) @ chartjs-plugin-streaming@2.0.0:7
c @ chart.js@3.9.1:7
(anonymous) @ chartjs-plugin-streaming@2.0.0:7
setInterval
l @ chartjs-plugin-streaming@2.0.0:7
init @ chartjs-plugin-streaming@2.0.0:7
(anonymous) @ chart.js@3.9.1:13
d @ chart.js@3.9.1:7
buildOrUpdateScales @ chart.js@3.9.1:13
_updateScales @ chart.js@3.9.1:13
update @ chart.js@3.9.1:13
(anonymous) @ chart.js@3.9.1:13
(anonymous) @ chart.js@3.9.1:7
_resize @ chart.js@3.9.1:13
resize @ chart.js@3.9.1:13
a @ chart.js@3.9.1:13
bindResponsiveEvents @ chart.js@3.9.1:13
bindEvents @ chart.js@3.9.1:13
_initialize @ chart.js@3.9.1:13
bn @ chart.js@3.9.1:13
(anonymous) @ (index):25Understand this errorAI
21:56:47.928 chartjs-adapter-date-fns@2.0.0:7 Uncaught TypeError: Cannot read properties of undefined (reading 'startOfDay')
    at vn.startOf (chartjs-adapter-date-fns@2.0.0:7:1876)
    at w.determineDataLimits (chart.js@3.9.1:13:185525)
    at w.update (chart.js@3.9.1:13:63316)
    at w.update (chartjs-plugin-streaming@2.0.0:7:8205)
    at qi (chart.js@3.9.1:13:35179)
    at Object.update (chart.js@3.9.1:13:37572)
    at bn._updateLayout (chart.js@3.9.1:13:93740)
    at bn.update (chart.js@3.9.1:13:92568)
    at chartjs-plugin-streaming@2.0.0:7:6945
    at Object.c [as callback] (chart.js@3.9.1:7:911)
startOf @ chartjs-adapter-date-fns@2.0.0:7
determineDataLimits @ chart.js@3.9.1:13
update @ chart.js@3.9.1:13
update @ chartjs-plugin-streaming@2.0.0:7
qi @ chart.js@3.9.1:13
update @ chart.js@3.9.1:13
_updateLayout @ chart.js@3.9.1:13
update @ chart.js@3.9.1:13
(anonymous) @ chartjs-plugin-streaming@2.0.0:7
c @ chart.js@3.9.1:7
(anonymous) @ chartjs-plugin-streaming@2.0.0:7
setInterval
l @ chartjs-plugin-streaming@2.0.0:7
init @ chartjs-plugin-streaming@2.0.0:7
(anonymous) @ chart.js@3.9.1:13
d @ chart.js@3.9.1:7
buildOrUpdateScales @ chart.js@3.9.1:13
_updateScales @ chart.js@3.9.1:13
update @ chart.js@3.9.1:13
(anonymous) @ chart.js@3.9.1:13
(anonymous) @ chart.js@3.9.1:7
_resize @ chart.js@3.9.1:13
resize @ chart.js@3.9.1:13
a @ chart.js@3.9.1:13
bindResponsiveEvents @ chart.js@3.9.1:13
bindEvents @ chart.js@3.9.1:13
_initialize @ chart.js@3.9.1:13
bn @ chart.js@3.9.1:13
(anonymous) @ (index):25Understand this errorAI
21:56:47.934 chartjs-adapter-date-fns@2.0.0:7 Uncaught TypeError: Cannot read properties of undefined (reading 'startOfDay')
    at vn.startOf (chartjs-adapter-date-fns@2.0.0:7:1876)
    at w.determineDataLimits (chart.js@3.9.1:13:185525)
    at w.update (chart.js@3.9.1:13:63316)
    at w.update (chartjs-plugin-streaming@2.0.0:7:8205)
    at qi (chart.js@3.9.1:13:35179)
    at Object.update (chart.js@3.9.1:13:37572)
    at bn._updateLayout (chart.js@3.9.1:13:93740)
    at bn.update (chart.js@3.9.1:13:92568)
    at chartjs-plugin-streaming@2.0.0:7:6945
    at Object.c [as callback] (chart.js@3.9.1:7:911)
startOf @ chartjs-adapter-date-fns@2.0.0:7
determineDataLimits @ chart.js@3.9.1:13
update @ chart.js@3.9.1:13
update @ chartjs-plugin-streaming@2.0.0:7
qi @ chart.js@3.9.1:13
update @ chart.js@3.9.1:13
_updateLayout @ chart.js@3.9.1:13
update @ chart.js@3.9.1:13
(anonymous) @ chartjs-plugin-streaming@2.0.0:7
c @ chart.js@3.9.1:7
(anonymous) @ chartjs-plugin-streaming@2.0.0:7
setInterval
l @ chartjs-plugin-streaming@2.0.0:7
init @ chartjs-plugin-streaming@2.0.0:7
(anonymous) @ chart.js@3.9.1:13
d @ chart.js@3.9.1:7
buildOrUpdateScales @ chart.js@3.9.1:13
_updateScales @ chart.js@3.9.1:13
update @ chart.js@3.9.1:13
(anonymous) @ chart.js@3.9.1:13
(anonymous) @ chart.js@3.9.1:7
_resize @ chart.js@3.9.1:13
resize @ chart.js@3.9.1:13
a @ chart.js@3.9.1:13
bindResponsiveEvents @ chart.js@3.9.1:13
bindEvents @ chart.js@3.9.1:13
```
