import {useCallback, useMemo, useState} from "react";
import useWebSocket from "react-use-websocket";
import {
    ClientWebSocketAction,
    DialogTurn,
    SessionConfig,
    SessionPresetConfig,
    WebSocketEvent,
    WebSocketEventArgs
} from "../types";
import {ChatPanel} from "./ChatPanel";
import {ConfigPanel} from "./ConfigPanel";
import {useDebounceCallback} from "@react-hook/debounce";

const DEFAULT_CONFIG: SessionPresetConfig = {
    type: 'preset',
    topic: 'sleep',
    format: 'descriptive',
    modifier: true,
    model: 'text-davinci-003'
}

export const ChatbotPlayground = () => {

    const [sessionConfig, setSessionConfig] = useState<SessionConfig>(DEFAULT_CONFIG)

    const [isProcessing, setIsProcessing] = useState(false)

    const [dialog, setDialog] = useState<Array<DialogTurn>>([])

    const webSocketUrl = useMemo(()=>{
        const url = new URL(process.env.REACT_APP_API_URL!!)
        return "ws://" + url.hostname + ":" + url.port + "/api/v1/chat/ws"
    }, [])

    const onWebSocketMessage = useCallback((event: WebSocketEventMap['message']) => {
        const messageObject: WebSocketEventArgs = JSON.parse(event.data)

        switch(messageObject.event){
            case WebSocketEvent.IsProcessing:
                setIsProcessing(messageObject.data)
                break;
            case WebSocketEvent.NewMessage:
                const copied = dialog.slice()
                copied.push(messageObject.data)
                setDialog(copied)
                break;
        }

    }, [dialog])

    const onWebSocketOpen = useCallback(()=>{
        sendJsonMessage({action: ClientWebSocketAction.InitChatSession, data: sessionConfig as any})
        setDialog([])
    }, [sessionConfig])

    const { readyState, sendJsonMessage } = useWebSocket(webSocketUrl, {
        onMessage: onWebSocketMessage,
        onOpen: onWebSocketOpen,
        share: true,
        retryOnError: true
    })

    const onUserNewMessage = useCallback((message: string) => {
            sendJsonMessage({action: ClientWebSocketAction.InsertUserMessage, data: message})
        }, [sendJsonMessage])

    const onConfigChanged = useDebounceCallback((config: SessionConfig)=>{
        setSessionConfig(config)
        sendJsonMessage({action: ClientWebSocketAction.InitChatSession, data: config as any})
        setDialog([])
    }, 200, false)

    return <div className="container mx-auto">
        <div className={"mx-6 bg-white rounded-xl flex flex-row"}>
        <div className={"flex-1 bg-slate-50 border-r-[1px] rounded-l-xl"}>
            <ConfigPanel config={sessionConfig} onConfigUpdate={onConfigChanged}/>
        </div>
        <ChatPanel dialog={dialog} isProcessing={isProcessing}
                   className={"flex-1"}
                   inputContainerClassName={"rounded-br-xl"}
                   onUserNewMessage={onUserNewMessage}/>
            </div>
    </div>
}