from starlette.websockets import WebSocket

import asyncio

from chatbot.chatbot import ChatSession, DialogTurn


class ChatEvent:
    NewMessage = "new-message"
    IsProcessing = "is-processing"
    MountPromptTemplate = "mount-prompt-template"

class ChatSessionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.chat_sessions: dict[WebSocket, ChatSession] = {}

    @property
    def num_connections(self):
        return len(self.active_connections)

    async def connect_client(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect_client(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        if websocket in self.chat_sessions:
            if self.chat_sessions[websocket] is not None:
                self.chat_sessions[websocket].dispose()

            self.chat_sessions.pop(websocket)

    async def init_session(self, websocket: WebSocket, session: ChatSession):

        async def handle_new_message(turn: DialogTurn):
            await websocket.send_json({"event": ChatEvent.NewMessage, "data": {"message": turn.message, "is_user": turn.is_user}}, "text")

        async def handle_is_processing(is_processing: bool):
            await websocket.send_json({"event": ChatEvent.IsProcessing, "data": is_processing}, "text")

        if websocket in self.chat_sessions:
            if self.chat_sessions[websocket] is not None:
                self.chat_sessions[websocket].dispose()

        self.chat_sessions[websocket] = session
        session.on_new_message.subscribe(
            on_next=handle_new_message)
        await session.on_is_processing.subscribe(
            on_next=handle_is_processing)
        await session.initialize()

    async def insert_user_message(self, websocket: WebSocket, message: str):
        if websocket in self.chat_sessions:
            if self.chat_sessions[websocket] is not None:
                await self.chat_sessions[websocket].push_user_message(message)


chat_session_manager = ChatSessionManager()
