import {useCallback, useMemo, useState} from "react";
import useWebSocket from "react-use-websocket";
import {ClientWebSocketAction, DialogTurn, WebSocketEvent, WebSocketEventArgs} from "../types";
import {ChatPanel} from "./ChatPanel";

export const ChatbotPlayground = () => {

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
        sendJsonMessage({action: ClientWebSocketAction.InitChatSession})
        setDialog([])
    }, [])

    const { readyState, sendJsonMessage } = useWebSocket(webSocketUrl, {
        onMessage: onWebSocketMessage,
        onOpen: onWebSocketOpen,
        share: true,
        retryOnError: true
    })

    const onUserNewMessage = useCallback((message: string) => {
            sendJsonMessage({action: ClientWebSocketAction.InsertUserMessage, data: message})
        }, [sendJsonMessage])

    return <div className="container mx-auto bg-white rounded-xl flex flex-row">
        <div className={"flex-1 bg-slate-50 border-r-[1px] rounded-l-xl"}></div>
        <ChatPanel dialog={dialog} isProcessing={isProcessing}
                   className={"flex-1"}
                   inputContainerClassName={"rounded-br-xl"}
                   onUserNewMessage={onUserNewMessage}/>
    </div>
}