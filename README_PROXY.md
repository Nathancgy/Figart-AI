# TCP Proxy for Figart-AI

This directory contains TCP proxy scripts that allow you to forward connections between your local machine and a remote server (192.168.8.120) for the Figart-AI application.

## Scripts

1. `tcp_proxy.py` - Forwards connections from localhost to 192.168.8.120
2. `reverse_proxy.py` - Forwards connections from 192.168.8.120 to localhost

Both scripts forward ports 8000 (API server) and 3000 (frontend server).

## Requirements

- Python 3.6+
- No additional packages required (uses standard library only)

## Usage

### On Your Local Machine

To forward connections from your local machine to the remote server:

```bash
python tcp_proxy.py
```

This will allow you to access the remote services as if they were running locally:
- API server: http://localhost:8000
- Frontend server: http://localhost:3000

### On the Remote Machine

To forward connections from the remote machine to your local machine:

```bash
python reverse_proxy.py
```

This allows the remote machine to access services running on your local machine.

### Command Line Options

Both scripts support the following command line options:

- `--local-host IP` - Specify the local host to bind to (default: 127.0.0.1 for tcp_proxy.py, 192.168.8.120 for reverse_proxy.py)
- `--remote-host IP` - Specify the remote host to connect to (default: 192.168.8.120 for tcp_proxy.py, 127.0.0.1 for reverse_proxy.py)
- `--verbose` or `-v` - Enable verbose logging

Example:
```bash
python tcp_proxy.py --verbose
```

## How It Works

The proxy creates a server socket on the specified local host and port. When a client connects to this socket, the proxy establishes a connection to the remote host on the same port. It then forwards all data between these two connections in both directions.

Each port (8000 and 3000) is handled by a separate proxy instance running in its own thread.

## Troubleshooting

1. **Connection refused errors**: Make sure the target services are running on the respective ports.
2. **Permission errors**: You might need elevated privileges to bind to ports below 1024.
3. **Address already in use**: Another process might be using the port. Check with `netstat -tuln` or `lsof -i`.

## Stopping the Proxy

Press `Ctrl+C` to stop the proxy. The script will gracefully close all connections before exiting. 