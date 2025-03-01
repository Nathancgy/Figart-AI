#!/usr/bin/env python3
"""
TCP Proxy for Figart-AI

This script creates a bidirectional TCP proxy between localhost and 192.168.8.120
for ports 8000 (API server) and 3000 (frontend server).
It also accepts connections on port 80 and forwards them to port 3000.

Usage:
    python tcp_proxy.py

Press Ctrl+C to stop the proxy.
"""

import socket
import select
import threading
import time
import sys
import argparse
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('tcp_proxy')

# Default configuration
DEFAULT_LOCAL_HOST = '127.0.0.1'
DEFAULT_REMOTE_HOST = '192.168.8.120'
PROXY_PORTS = [8000, 3000]  # API and frontend ports
PORT_MAPPINGS = {
    80: 3000  # Map local port 80 to remote port 3000
}
BUFFER_SIZE = 4096

class TCPProxy:
    """Bidirectional TCP proxy that forwards connections between local and remote hosts."""
    
    def __init__(self, local_host, remote_host, local_port, remote_port=None):
        """Initialize the TCP proxy for a specific port."""
        self.local_host = local_host
        self.remote_host = remote_host
        self.local_port = local_port
        self.remote_port = remote_port if remote_port else local_port
        self.server_socket = None
        self.connections = []
        self.running = False
    
    def start(self):
        """Start the proxy server."""
        try:
            self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.server_socket.bind((self.local_host, self.local_port))
            self.server_socket.listen(5)
            self.running = True
            
            logger.info(f"Proxy listening on {self.local_host}:{self.local_port} -> {self.remote_host}:{self.remote_port}")
            
            while self.running:
                try:
                    client_socket, addr = self.server_socket.accept()
                    logger.info(f"Connection from {addr[0]}:{addr[1]} to port {self.local_port}")
                    
                    # Connect to remote server
                    remote_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    remote_socket.connect((self.remote_host, self.remote_port))
                    
                    # Start bidirectional forwarding
                    client_thread = threading.Thread(
                        target=self.forward_data,
                        args=(client_socket, remote_socket, f"{addr[0]}:{addr[1]}", f"{self.remote_host}:{self.remote_port}")
                    )
                    client_thread.daemon = True
                    client_thread.start()
                    
                    remote_thread = threading.Thread(
                        target=self.forward_data,
                        args=(remote_socket, client_socket, f"{self.remote_host}:{self.remote_port}", f"{addr[0]}:{addr[1]}")
                    )
                    remote_thread.daemon = True
                    remote_thread.start()
                    
                    self.connections.append((client_socket, remote_socket))
                    
                except (socket.error, OSError) as e:
                    if self.running:  # Only log if we're still supposed to be running
                        logger.error(f"Socket error on port {self.local_port}: {e}")
                    break
                
        except Exception as e:
            logger.error(f"Error starting proxy on port {self.local_port}: {e}")
        finally:
            self.stop()
    
    def forward_data(self, source, destination, source_addr, dest_addr):
        """Forward data between source and destination sockets."""
        try:
            while self.running:
                # Check if source socket has data to read
                ready, _, _ = select.select([source], [], [], 1)
                if ready:
                    data = source.recv(BUFFER_SIZE)
                    if not data:
                        logger.info(f"Connection closed: {source_addr} -> {dest_addr}")
                        break
                    
                    # Forward data to destination
                    destination.sendall(data)
                    logger.debug(f"Forwarded {len(data)} bytes: {source_addr} -> {dest_addr}")
        except Exception as e:
            logger.error(f"Error forwarding data {source_addr} -> {dest_addr}: {e}")
        finally:
            # Ensure sockets are closed when forwarding ends
            try:
                source.close()
                destination.close()
            except:
                pass
    
    def stop(self):
        """Stop the proxy server."""
        self.running = False
        
        # Close all connections
        for client_socket, remote_socket in self.connections:
            try:
                client_socket.close()
                remote_socket.close()
            except:
                pass
        self.connections = []
        
        # Close server socket
        if self.server_socket:
            try:
                self.server_socket.close()
            except:
                pass
            self.server_socket = None
        
        logger.info(f"Proxy stopped for port {self.local_port}")

def main():
    """Main function to start the proxy servers."""
    parser = argparse.ArgumentParser(description='TCP Proxy for Figart-AI')
    parser.add_argument('--local-host', default=DEFAULT_LOCAL_HOST, help='Local host to bind to')
    parser.add_argument('--remote-host', default=DEFAULT_REMOTE_HOST, help='Remote host to connect to')
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose logging')
    parser.add_argument('--disable-port-80', action='store_true', help='Disable port 80 forwarding')
    args = parser.parse_args()
    
    if args.verbose:
        logger.setLevel(logging.DEBUG)
    
    # Create and start proxy for each port
    proxies = []
    proxy_threads = []
    
    try:
        # Standard port forwarding
        for port in PROXY_PORTS:
            proxy = TCPProxy(args.local_host, args.remote_host, port)
            proxies.append(proxy)
            
            thread = threading.Thread(target=proxy.start)
            thread.daemon = True
            thread.start()
            proxy_threads.append(thread)
        
        # Port mapping forwarding (e.g., 80 -> 3000)
        if not args.disable_port_80:
            for local_port, remote_port in PORT_MAPPINGS.items():
                try:
                    proxy = TCPProxy(args.local_host, args.remote_host, local_port, remote_port)
                    proxies.append(proxy)
                    
                    thread = threading.Thread(target=proxy.start)
                    thread.daemon = True
                    thread.start()
                    proxy_threads.append(thread)
                except Exception as e:
                    logger.error(f"Failed to set up port mapping {local_port} -> {remote_port}: {e}")
                    logger.warning("Port 80 typically requires root/admin privileges. Try running with sudo/as administrator.")
        
        logger.info(f"TCP Proxy running for ports {PROXY_PORTS}")
        if not args.disable_port_80:
            logger.info(f"Port mappings: {PORT_MAPPINGS}")
        logger.info("Press Ctrl+C to stop")
        
        # Keep the main thread alive
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        logger.info("Shutting down proxy...")
    finally:
        # Stop all proxies
        for proxy in proxies:
            proxy.stop()
        
        # Wait for threads to finish
        for thread in proxy_threads:
            thread.join(timeout=2)
        
        logger.info("Proxy shutdown complete")

if __name__ == "__main__":
    main() 