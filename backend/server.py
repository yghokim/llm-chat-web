from time import perf_counter
from re import compile
from os import path, getcwd

from fastapi import FastAPI, Request, Path
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import HTMLResponse, FileResponse
from starlette.staticfiles import StaticFiles

from dotenv import load_dotenv

from chatbot.chatbot import DialogTurn
from chatbot.generators.gpt3_generator import GPT3StaticPromptResponseGenerator
from .routers import chat

print("Load env:", load_dotenv(path.join(getcwd(), ".env")))

app = FastAPI()

app.include_router(chat.router, prefix="/api/v1/chat")

##########################################################

asset_path_regex = compile("\.[a-z][a-z0-9]+$")

static_frontend_path = path.join(getcwd(), "frontend/build")
if path.exists(static_frontend_path):
    @app.get("/{rest_of_path:path}", response_class=HTMLResponse)
    def redirect_frontend_nested_url(*, rest_of_path: str):

        if len(asset_path_regex.findall(rest_of_path)) > 0:
            # This is a static asset file path.
            return FileResponse(path.join(static_frontend_path, rest_of_path))
        else:
            return HTMLResponse(
                status_code=200,
                content=open(path.join(static_frontend_path, "index.html")).read()
            )


    app.mount("/", StaticFiles(directory=static_frontend_path, html=True), name="static")
    print("Compiled static frontend file path was found. Mount the file.")

# Middlewares==========

origins = [
    "http://localhost:3000",
    "localhost:3000",
    "http://localhost:8000",
    "localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-processing-time", "X-request-id", "X-context-id"]
)

@app.get("/chat/{message}")
async def chat(message: str = Path(...)):
    gen = GPT3StaticPromptResponseGenerator.from_yml("assets/gpt3-chatbots/diet-001.yml")
    response, elapsed = await gen.get_response([DialogTurn(message, True)])

    return {"response": response, "elapsed": elapsed }



@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start = perf_counter()
    response = await call_next(request)
    end = perf_counter()
    response.headers["X-processing-time"] = str(end - start)
    return response