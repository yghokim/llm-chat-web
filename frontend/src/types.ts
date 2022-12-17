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

export interface SessionConfigBase{
    type: "preset" | "custom"
    model: string
}

export interface SessionPresetConfig extends SessionConfigBase{
    type: "preset"
    format: "specific"|"descriptive"
    modifier: boolean
    topic: "sleep" | "diet" | "work" | "exercise"
}


export interface SessionCustomConfig extends SessionConfigBase{
    type: "custom",
    prompt_body: string
}

export type SessionConfig = SessionPresetConfig | SessionCustomConfig