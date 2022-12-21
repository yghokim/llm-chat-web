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

        self.session_id_websocket_map: dict[WebSocket, str] = {}

        self.chat_sessions: dict[str, ChatSession] = {}

    @property
    def num_connections(self):
        return len(self.active_connections)

    async def connect_client(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect_client(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        if websocket in self.session_id_websocket_map:
            del self.session_id_websocket_map[websocket]

    def terminate_session(self, session_id: str):
        if session_id in self.chat_sessions:
            print(f"Session naturally terminated - {session_id}")
            self.chat_sessions[session_id].dispose()
            del self.chat_sessions[session_id]

    async def restart_session(self, websocket):
        print(f"Restart session - {self.session_id_websocket_map[websocket]}")
        if websocket in self.session_id_websocket_map:
            if self.chat_sessions[self.session_id_websocket_map[websocket]] is not None:
                await self.chat_sessions[self.session_id_websocket_map[websocket]].initialize()

    async def register_client(self, websocket: WebSocket, session_id: str):
        if session_id in self.chat_sessions:
            self.session_id_websocket_map[websocket] = session_id

            session = self.chat_sessions[session_id]
            session.dispose()

            async def handle_new_message(turn: DialogTurn):
                await websocket.send_json(
                    {"event": ChatEvent.NewMessage, "data": {"message": turn.message, "is_user": turn.is_user}}, "text")

            async def handle_is_processing(is_processing: bool):
                await websocket.send_json({"event": ChatEvent.IsProcessing, "data": is_processing}, "text")

            session.on_new_message.subscribe(
                on_next=handle_new_message)
            await session.on_is_processing.subscribe(
                on_next=handle_is_processing)

    async def init_session(self, websocket: WebSocket, session: ChatSession):

        self.chat_sessions[session.id] = session

        if websocket in self.session_id_websocket_map:
            old_session_id = self.session_id_websocket_map[websocket]
            if old_session_id in self.chat_sessions and self.chat_sessions[old_session_id] is not None:
                self.chat_sessions[old_session_id].dispose()

        self.session_id_websocket_map[websocket] = session.id

        await self.register_client(websocket, session.id)
        await session.initialize()

    async def insert_user_message(self, websocket: WebSocket, message: str):
        if websocket in self.session_id_websocket_map:
            if self.chat_sessions[self.session_id_websocket_map[websocket]] is not None:
                await self.chat_sessions[self.session_id_websocket_map[websocket]].push_user_message(message)

    async def regen_system_message(self, websocket: WebSocket):
        if websocket in self.session_id_websocket_map:
            if self.chat_sessions[self.session_id_websocket_map[websocket]] is not None:
                await self.chat_sessions[self.session_id_websocket_map[websocket]].regen_system_message()


chat_session_manager = ChatSessionManager()
