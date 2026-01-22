from http.server import HTTPServer, SimpleHTTPRequestHandler
import webbrowser
port = 8500

def startUp():
    webbrowser.open(f"http://localhost:{port}",new=2)
    server = HTTPServer(("localhost",port),SimpleHTTPRequestHandler)
    server.serve_forever()

def main():
    print(f"http://localhost:{port}")
    startUp()

if __name__ == "__main__":
    main()