import tiktoken
import yaml
from fastapi import APIRouter, Depends, HTTPException
from starlette.websockets import WebSocket, WebSocketDisconnect

from chatbot.chat_session_manager import chat_session_manager, ChatEvent
from chatbot.chatbot import ChatSession
from chatbot.generators.gpt3_generator import GPT3StaticPromptResponseGenerator


class ClientWebSocketAction:
    InsertUserMessage = "insert-user-message"
    InitChatSession = "init-chat-session"
    RegenerateSystemMessage = "regen-system-message"
    RestartChatSession = "restart-chat-session"

def _get_gpt3_chatbot_config_path(session_config: dict):
    if session_config["format"] == 'specific' and session_config["modifier"] is True:
        index = 1
    elif session_config["format"] == 'specific' and session_config['modifier'] is False:
        index = 2
    elif session_config["format"] == 'descriptive' and session_config['modifier'] is True:
        index = 3
    else:
        index = 4

    return f"assets/gpt3-chatbots/{session_config['topic']}-00{index}.yml"

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await chat_session_manager.connect_client(websocket)
    try:
        while True:
            client_data = await websocket.receive_json()
            if client_data["action"] == ClientWebSocketAction.InsertUserMessage:
                await chat_session_manager.insert_user_message(websocket, client_data["data"])
            elif client_data["action"] == ClientWebSocketAction.RegenerateSystemMessage:
                await chat_session_manager.regen_system_message(websocket)
            elif client_data["action"] == ClientWebSocketAction.RestartChatSession:
                await chat_session_manager.restart_session(websocket)
            elif client_data["action"] == ClientWebSocketAction.InitChatSession:
                print(f"Init new chat session - {client_data['data']}")
                session_config = client_data['data']
                if session_config["type"] == 'preset':
                    template_path = _get_gpt3_chatbot_config_path(session_config)
                    with open(template_path) as tf:
                        yml = yaml.load(tf, yaml.FullLoader)
                        await websocket.send_json({"event": ChatEvent.MountPromptTemplate, "data": yml["prompt-base"]}, "text")
                    await chat_session_manager.init_session(websocket, ChatSession(
                        GPT3StaticPromptResponseGenerator.from_yml(template_path, session_config["model"])))
                elif session_config["type"] == "custom":
                    encoder = tiktoken.get_encoding("gpt2")
                    token_len = len(encoder.encode(session_config["prompt_body"]))
                    if token_len < 400:
                        await chat_session_manager.init_session(websocket, ChatSession(
                            GPT3StaticPromptResponseGenerator(prompt_base=session_config["prompt_body"], gpt3_model=session_config["model"])))
    except WebSocketDisconnect as disconnect_ex:
        print(f"WebSocket disconnect - {disconnect_ex.reason}, {disconnect_ex.code}")
        chat_session_manager.disconnect_client(websocket)
