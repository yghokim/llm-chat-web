import {useCallback, useMemo, useState} from "react";
import useWebSocket from "react-use-websocket";
import {
    ClientWebSocketAction, DEFAULT_PRESET_CONFIG,
    DialogTurn,
    SessionConfig,
    WebSocketEvent,
    WebSocketEventArgs
} from "../types";
import {ChatPanel} from "./ChatPanel";
import {ConfigPanel} from "./ConfigPanel";
import {useDebounceCallback} from "@react-hook/debounce";

export const ChatbotPlayground = () => {

    const [sessionConfig, setSessionConfig] = useState<SessionConfig>(DEFAULT_PRESET_CONFIG)
    const [promptTemplate, setPromptTemplate] = useState<string | undefined>(undefined)

    const [isProcessing, setIsProcessing] = useState(false)

    const [dialog, setDialog] = useState<Array<DialogTurn>>([])

    const webSocketUrl = useMemo(() => {
        const url = new URL(process.env.REACT_APP_API_URL!!)
        return "ws://" + url.hostname + ":" + url.port + "/api/v1/chat/ws"
    }, [])

    const onWebSocketMessage = useCallback((event: WebSocketEventMap['message']) => {
        const messageObject: WebSocketEventArgs = JSON.parse(event.data)

        switch (messageObject.event) {
            case WebSocketEvent.IsProcessing:
                setIsProcessing(messageObject.data)
                break;
            case WebSocketEvent.NewMessage:
                const copied = dialog.slice()
                copied.push(messageObject.data)
                setDialog(copied)
                break;
            case WebSocketEvent.MountPromptTemplate:
                setPromptTemplate(messageObject.data)
                break;
        }

    }, [dialog])

    const onWebSocketOpen = useDebounceCallback(useCallback(() => {
        sendJsonMessage({action: ClientWebSocketAction.InitChatSession, data: sessionConfig as any})
        setDialog([])
    }, [sessionConfig]), 200, false)

    const {readyState, sendJsonMessage} = useWebSocket(webSocketUrl, {
        onMessage: onWebSocketMessage,
        onOpen: onWebSocketOpen,
        share: true,
        retryOnError: true
    })

    const onUserNewMessage = useCallback((message: string) => {
        sendJsonMessage({action: ClientWebSocketAction.InsertUserMessage, data: message})
    }, [sendJsonMessage])

    const onConfigChanged = useCallback((config: SessionConfig) => {
        setSessionConfig(config)
        onWebSocketOpen()
    }, [onWebSocketOpen])

    const regenerateLastSystemMessage = useCallback(() => {
                           const copied = dialog.slice()
                           copied.pop()
                           setDialog(copied)
                           sendJsonMessage({action: ClientWebSocketAction.RegenerateSystemMessage})
                       }, [dialog, sendJsonMessage])

    return <div className="container mx-auto">
        <div className={"mx-6 bg-white rounded-xl flex flex-col md:flex-row shadow-2xl"}>
            <div className={"max-md:h-[400px] md:flex-1 bg-slate-50 border-r-[1px] rounded-t-xl rounded-b-none md:rounded-l-xl md:rounded-r-none"}>
                <ConfigPanel config={sessionConfig} onConfigUpdate={onConfigChanged} promptTemplate={promptTemplate}/>
            </div>
            <ChatPanel dialog={dialog} isProcessing={isProcessing}
                       className={"md:flex-1 border-t-gray-200 border-t-[1px] md:border-none"}
                       inputContainerClassName={"rounded-b-xl md:rounded-br-xl md:rounded-l-none"}
                       onUserNewMessage={onUserNewMessage}
                       onRegenerationRequest={regenerateLastSystemMessage}/>
        </div>
    </div>
}