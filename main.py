import argparse
import uvicorn

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--production", dest="debug", action="store_false")
    parser.add_argument("--debug", dest="debug", action="store_true")

    parser.add_argument("--port", dest="port", type=int, default=8000)

    parser.set_defaults(debug=True)

    args = parser.parse_args()

    uvicorn.run("backend.server:app", host="0.0.0.0", port=args.port, reload=args.debug)