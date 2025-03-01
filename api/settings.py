import socket

IP = "192.168.8.115"#socket.gethostbyname(socket.gethostname())

DB = "sqlite:///db.sqlite3"
# Include all possible origins for development
HOSTS = [
    # Localhost origins
    "http://localhost:8000", 
    "http://localhost:3000",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:3000",
    
    # IP-based origins
    f"http://{IP}:8000", 
    f"http://{IP}:3000",
    "http://192.168.8.115:8000",
    "http://192.168.8.115:3000",
    "http://10.211.55.2:8000",
    "http://10.211.55.2:3000",
    "http://10.37.129.2:8000",
    "http://10.37.129.2:3000",
    
    # Hostname-based origins
    "http://lshomes-MacBook-Pro.local:8000",
    "http://lshomes-MacBook-Pro.local:3000"
]

RUN_TESTS = False

RUNNING_ON_PROD = False
if RUNNING_ON_PROD:
    DB = "postgres:///localhost:5432"