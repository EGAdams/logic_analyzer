import RPi.GPIO as GPIO
import time

DATA_PIN = 17  # Serial data out from shift register
CLOCK_PIN = 27  # Clock pin for the shift register
LATCH_PIN = 22  # Latch pin to load data

GPIO.setmode(GPIO.BCM)
GPIO.setup(DATA_PIN, GPIO.IN)
GPIO.setup(CLOCK_PIN, GPIO.OUT)
GPIO.setup(LATCH_PIN, GPIO.OUT)

def read_shift_register():
    GPIO.output(LATCH_PIN, 0)
    time.sleep(0.01)  # Small delay to stabilize
    GPIO.output(LATCH_PIN, 1)  # Load data from parallel to serial

    data = []
    for _ in range(8):  # Assuming 8 bits
        GPIO.output(CLOCK_PIN, 1)
        data.append(GPIO.input(DATA_PIN))
        GPIO.output(CLOCK_PIN, 0)
    return data

try:
    while True:
        data = read_shift_register()
        print(f"Shift Register Data: {data}")
        time.sleep(0.5)
except KeyboardInterrupt:
    print("Exiting...")
finally:
    GPIO.cleanup()
