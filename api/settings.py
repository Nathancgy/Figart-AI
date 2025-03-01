import socket

IP = socket.gethostbyname(socket.gethostname())

DB = "sqlite:///db.sqlite3"
HOSTS = ["http://localhost:8000", "http://localhost:3000"]
HOSTS += ["http://"+IP+":8000", "http://"+IP+":3000"]
RUN_TESTS = False