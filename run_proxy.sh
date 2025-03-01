#!/bin/bash
# Run TCP Proxy with administrator privileges

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "This script needs to run as root to bind to port 80."
  echo "Attempting to run with sudo..."
  sudo "$0" "$@"
  exit $?
fi

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Run the proxy
echo "Starting TCP Proxy with port 80 forwarding..."
python3 tcp_proxy.py "$@" 