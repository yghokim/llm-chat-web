import {useCallback, useEffect, useRef, useState} from "react";
import {
    ClientWebSocketAction, DEFAULT_PRESET_CONFIG,
    DialogTurn,
    SessionConfig,
    WebSocketEvent,
    WebSocketEventArgs
} from "../types";
import {ChatPanel} from "./ChatPanel";
import {ConfigPanel} from "./ConfigPanel";
import { nanoid } from 'nanoid'


const url = new URL(process.env.REACT_APP_API_URL!!)
const WEBSOCKET_URL = (url.protocol.startsWith("http:") ? "ws://" : "wss://") + url.hostname + ":" + url.port + "/api/v1/chat/ws"

export const ChatbotPlayground = () => {

    const sessionIdRef = useRef<string | null>(null)

    const [sessionConfig, setSessionConfig] = useState<SessionConfig>(DEFAULT_PRESET_CONFIG)
    const hasConnectedToServer = useRef(false)

    const [promptTemplate, setPromptTemplate] = useState<string | undefined>(undefined)

    const [isProcessing, setIsProcessing] = useState(false)

    const [dialog, setDialog] = useState<Array<DialogTurn>>([])

    const [websocketConnected, setWebsocketConnected] = useState(false)

    const websocket = useRef<WebSocket|null>(null)
    const onMessageRef = useRef<((event: WebSocketEventMap['message']) => void) | null>(null)

    const sendJsonMessage = useCallback((data: object)=>{
        if(websocketConnected){
            websocket.current?.send(JSON.stringify(data))
        }else{
            console.log("Websocket is not connected.")
        }
    }, [websocketConnected])

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

    const unmounted = useRef(false)

    useEffect(()=>{

        sessionIdRef.current = nanoid(30)

        const initWebsocket = () => {
            if(websocket.current == null || websocket.current.readyState >= 2) {
                websocket.current = new WebSocket(WEBSOCKET_URL)
                websocket.current.onopen = () => {
                    console.log("Websocket was connected", sessionIdRef.current)
                    setWebsocketConnected(true)
                    if(hasConnectedToServer.current === false){
                        setTimeout(()=>{
                            websocket.current?.send(JSON.stringify({
                                session_id: sessionIdRef.current,
                                action: ClientWebSocketAction.InitChatSession,
                                data: sessionConfig as any
                            }))
                            setDialog([])
                            hasConnectedToServer.current = true
                        }, 100)
                    }else{
                        websocket.current?.send(JSON.stringify({
                                session_id: sessionIdRef.current,
                                action: ClientWebSocketAction.RegisterClient,
                        }))
                    }
                }

                websocket.current.onmessage = (ev) => {
                    onMessageRef.current?.(ev)
                }

                websocket.current.onclose = (ev) => {
                    console.log("Websocket was closed.")
                    setWebsocketConnected(false)
                    setTimeout(initWebsocket, 2000);
                }
            }else{
                console.log("Websocket is already active. Skip reconnection.")
            }
        }
        initWebsocket()

        const onUnload = ()=>{
            websocket.current?.send(JSON.stringify({action: ClientWebSocketAction.TerminateSession, session_id: sessionIdRef.current}))
        }

        window.addEventListener('unload', onUnload)

        return () => {
            unmounted.current = true
            window.removeEventListener('unload', onUnload)
        }
    }, [])

    useEffect(()=>{
        onMessageRef.current = onWebSocketMessage
    }, [onWebSocketMessage])


    const onUserNewMessage = useCallback((message: string) => {
        sendJsonMessage({action: ClientWebSocketAction.InsertUserMessage, data: message})
    }, [sendJsonMessage])

    const onConfigChanged = useCallback((config: SessionConfig) => {
        setSessionConfig(config)
        sendJsonMessage({session_id: sessionIdRef.current, action: ClientWebSocketAction.InitChatSession, data: config as any})
        setDialog([])
    }, [sendJsonMessage])

    const regenerateLastSystemMessage = useCallback(() => {
                           const copied = dialog.slice()
                           copied.pop()
                           setDialog(copied)
                           sendJsonMessage({action: ClientWebSocketAction.RegenerateSystemMessage})
                       }, [dialog, sendJsonMessage])

    const restartSession = useCallback(()=>{
                           setDialog([])
                           sendJsonMessage({action: ClientWebSocketAction.RestartChatSession})
            }, [sendJsonMessage])

    return <div className="container mx-auto">
        <div className={"mx-6 bg-white rounded-xl flex flex-col md:flex-row shadow-2xl"}>
            <div className={"max-md:h-[400px] md:flex-1 bg-slate-50 border-r-[1px] rounded-t-xl rounded-b-none md:rounded-l-xl md:rounded-r-none"}>
                <ConfigPanel config={sessionConfig} onConfigUpdate={onConfigChanged} promptTemplate={promptTemplate}/>
            </div>
            <ChatPanel dialog={dialog} isProcessing={isProcessing}
                       className={"md:flex-1 border-t-gray-200 border-t-[1px] md:border-none"}
                       inputContainerClassName={"rounded-b-xl md:rounded-br-xl md:rounded-l-none"}
                       onUserNewMessage={onUserNewMessage}
                       onRegenerationRequest={regenerateLastSystemMessage} onRestartRequest={restartSession}/>
        </div>
    </div>
}