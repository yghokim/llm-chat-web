import {useCallback, useMemo, useState} from "react";
import useWebSocket from "react-use-websocket";
import {
    ClientWebSocketAction, DEFAULT_PRESET_CONFIG,
    DialogTurn,
    SessionConfig,
    SessionPresetConfig,
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


    return <div className="container mx-auto">
        <div className={"mx-6 bg-white rounded-xl flex flex-row shadow-2xl"}>
            <div className={"flex-1 bg-slate-50 border-r-[1px] rounded-l-xl"}>
                <ConfigPanel config={sessionConfig} onConfigUpdate={onConfigChanged} promptTemplate={promptTemplate}/>
            </div>
            <ChatPanel dialog={dialog} isProcessing={isProcessing}
                       className={"flex-1"}
                       inputContainerClassName={"rounded-br-xl"}
                       onUserNewMessage={onUserNewMessage}/>
        </div>
    </div>
}