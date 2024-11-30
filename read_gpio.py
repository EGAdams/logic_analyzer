import RPi.GPIO as GPIO
import time
import json
import socket

# Pin configuration
DATA_PIN = 17  # Replace with your GPIO pin

GPIO.setmode(GPIO.BCM)
GPIO.setup(DATA_PIN, GPIO.IN)

# Create a TCP socket to communicate with the WebSocket server
HOST = "127.0.0.1"  # WebSocket server running locally
PORT = 9000  # Port to match the WebSocket server

def send_to_server(data):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.connect((HOST, PORT))
            s.sendall(json.dumps(data).encode('utf-8'))
    except ConnectionRefusedError:
        print("Connection to server failed. Is it running?")

try:
    while True:
        pin_state = GPIO.input(DATA_PIN)
        send_to_server({"timestamp": time.time(), "state": pin_state})
        time.sleep(0.1)  # Adjust the delay as needed
except KeyboardInterrupt:
    GPIO.cleanup()
