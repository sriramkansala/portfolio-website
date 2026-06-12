import functools
from http.server import HTTPServer, SimpleHTTPRequestHandler

# Serve this folder explicitly; never calls os.getcwd() (sandbox-denied).
DIRECTORY = "/Users/SriramD/Documents/AI/Others/Port W 2/portfolio"
handler = functools.partial(SimpleHTTPRequestHandler, directory=DIRECTORY)
HTTPServer(("127.0.0.1", 4321), handler).serve_forever()
