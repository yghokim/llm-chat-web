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
                print("Init new chat session.")
                await chat_session_manager.init_session(websocket, ChatSession(
                    GPT3StaticPromptResponseGenerator.from_yml("assets/gpt3-chatbots/diet-001.yml")))
    except WebSocketDisconnect as disconnect_ex:
        print(f"WebSocket disconnect - {disconnect_ex.reason}, {disconnect_ex.code}")
        chat_session_manager.disconnect_client(websocket)
