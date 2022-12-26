import argparse
from os import path, getcwd, getenv

import uvicorn
from dotenv import load_dotenv


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--production", dest="debug", action="store_false")
    parser.add_argument("--debug", dest="debug", action="store_true")

    parser.add_argument("--https", dest="https", action="store_true")

    parser.add_argument("--port", dest="port", type=int, default=8000)

    parser.set_defaults(debug=True, https=False)

    args = parser.parse_args()

    ssl_keyfile = None
    ssl_certfile = None
    if args.https is True:
        load_dotenv(path.join(getcwd(), ".env"))
        ssl_keyfile = getenv("SSL_KEYFILE")
        ssl_certfile = getenv("SSL_CERTFILE")
        if ssl_keyfile is None or ssl_certfile is None:
            raise FileNotFoundError("You set to use HTTPS. Make sure that you set SSL_KEYFILE and SSL_CERTFILE in the .env file.")

    uvicorn.run("backend.server:app", host="0.0.0.0", port=args.port, reload=args.debug,
                ssl_keyfile=ssl_keyfile, ssl_certfile=ssl_certfile)