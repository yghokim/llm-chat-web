from fastapi import APIRouter, Depends, HTTPException
from starlette.websockets import WebSocket, WebSocketDisconnect

from chatbot.chat_session_manager import chat_session_manager
from chatbot.chatbot import ChatSession
from chatbot.generators.gpt3_generator import GPT3StaticPromptResponseGenerator


class ClientWebSocketAction:
    InsertUserMessage = "insert-user-message"
    InitChatSession = "init-chat-session"


router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await chat_session_manager.connect_client(websocket)
    try:
        while True:
            client_data = await websocket.receive_json()
            if client_data["action"] == ClientWebSocketAction.InsertUserMessage:
                await chat_session_manager.insert_user_message(websocket, client_data["data"])
            if client_data["action"] == ClientWebSocketAction.InitChatSession:
                print(f"Init new chat session - {client_data['data']}")
                session_config = client_data['data']
                if session_config["type"] == 'preset':
                    if session_config["format"] == 'specific' and session_config["modifier"] is True:
                        index = 1
                    elif session_config["format"] == 'specific' and session_config['modifier'] is False:
                        index = 2
                    elif session_config["format"] == 'descriptive' and session_config['modifier'] is True:
                        index = 3
                    else:
                        index = 4

                    await chat_session_manager.init_session(websocket, ChatSession(
                        GPT3StaticPromptResponseGenerator.from_yml(f"assets/gpt3-chatbots/{session_config['topic']}-00{index}.yml")))
    except WebSocketDisconnect as disconnect_ex:
        print(f"WebSocket disconnect - {disconnect_ex.reason}, {disconnect_ex.code}")
        chat_session_manager.disconnect_client(websocket)
