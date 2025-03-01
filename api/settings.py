import socket

IP = "192.168.8.115"#socket.gethostbyname(socket.gethostname())
print(IP)

DB = "sqlite:///db.sqlite3"
HOSTS = ["http://localhost:8000", "http://localhost:3000"]
HOSTS += ["http://"+IP+":8000", "http://"+IP+":3000"]
RUN_TESTS = False

RUNNING_ON_PROD = False
if RUNNING_ON_PROD:
    DB = "postgres:///localhost:5432"