export enum ClientWebSocketAction {
    InsertUserMessage = "insert-user-message",
    InitChatSession = "init-chat-session"
}

export enum WebSocketEvent {
    NewMessage = "new-message",
    IsProcessing = "is-processing"
}

export interface WebSocketEventArgs {
    event: WebSocketEvent,
    data: any
}

export interface WebSocketActionArgs {
    action: ClientWebSocketAction,
    data: any
}

export interface DialogTurn {
    is_user: boolean
    message: string
}