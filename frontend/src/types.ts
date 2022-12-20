export enum ClientWebSocketAction {
    InsertUserMessage = "insert-user-message",
    InitChatSession = "init-chat-session",
    RegenerateSystemMessage = "regen-system-message",
    RestartChatSession = "restart-chat-session"
}

export enum WebSocketEvent {
    NewMessage = "new-message",
    IsProcessing = "is-processing",
    MountPromptTemplate = "mount-prompt-template"
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


export const DEFAULT_PRESET_CONFIG: SessionPresetConfig = {
    type: 'preset',
    topic: 'sleep',
    format: 'descriptive',
    modifier: true,
    model: 'text-davinci-003'
}