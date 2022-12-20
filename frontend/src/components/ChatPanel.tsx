import {DialogTurn} from "../types";
import {ChangeEvent, useCallback, useEffect, useRef, useState} from "react";
import {useDebounceCallback} from "@react-hook/debounce";
import {PaperAirplaneIcon} from "@heroicons/react/24/solid";
import {ArrowPathIcon, ArrowUturnLeftIcon} from "@heroicons/react/20/solid";

export const ChatPanel = (props: {
    className?: string,
    inputContainerClassName?: string,
    dialog: Array<DialogTurn>,
    isProcessing: boolean,
    onUserNewMessage: (message: string) => void,
    onRegenerationRequest: () => void
    onRestartRequest: () => void
}) => {

    const scrollViewRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const [currentInput, setCurrentInput] = useState<string>("")
    const onInputChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        setCurrentInput(ev.target.value)
    }, [])

    const scrollToBottom = useDebounceCallback(() => {
        if (scrollViewRef?.current != null) {
            const scroll = scrollViewRef.current.scrollHeight -
                scrollViewRef.current.clientHeight;
            scrollViewRef.current.scrollTo({
                behavior: "smooth",
                top: scroll
            })
        }
    }, 100, false)

    const onSendButtonClick = useCallback(() => {
        scrollToBottom()
        if (currentInput.length > 0) {
            props.onUserNewMessage(currentInput)
            setCurrentInput("")
        }
    }, [currentInput, props.onUserNewMessage, scrollToBottom])


    const onKeyDown = useCallback((e: any) => {
        if (e.keyCode === 13) {
            onSendButtonClick()
        }
    }, [onSendButtonClick])

    const onRestartButtonClick = useCallback(() => {
        if (window.confirm("Discard the current dialog and restart conversation?")) {
            props.onRestartRequest()
        }
    }, [props.onRestartRequest])

    useEffect(() => {
        requestAnimationFrame(() => {
            scrollToBottom()
        })
    }, [props.dialog.length])

    return <div className={`flex flex-col h-[300px] md:h-[450px] ${props.className}`}>
        <div ref={scrollViewRef} className="flex-1 overflow-y-auto py-3 flex flex-col">
            <div className={"mb-auto"}>
                {
                    props.dialog.map((turn, i) => {
                        const isLastSystemMessage = props.dialog.length > 2 && i === props.dialog.length - 1 && !turn.is_user
                        return <div
                            className={`turn-container ${isLastSystemMessage ? "last-system-message" : undefined} ${turn.is_user ? "user" : "system"}`}
                            key={i}>
                            <span className="callout">
                                {turn.message}
                            </span>{
                            isLastSystemMessage && !props.isProcessing ? <button
                                className={"button-tiny ml-3 pl-1 flex items-center"}
                                onClick={props.onRegenerationRequest}
                            >
                                <ArrowPathIcon className={"w-4 mr-1"}/>
                                <span>Regenerate</span>
                            </button> : undefined
                        }
                        </div>
                    })
                }
                {
                    props.isProcessing && <span className="turn-container block">
                            <span className="callout w-auto bg-slate-300 animate-pulse">...</span>
                        </span>
                }
            </div>

            {
                !props.isProcessing && props.dialog.length > 1 ? <div className="flex justify-start pt-4 px-2">
                    <button
                        className={"button-tiny bg-transparent shadow-none justify-center flex items-center pl-1.5"}
                        onClick={onRestartButtonClick}
                    >
                        <ArrowUturnLeftIcon className={"w-4 mr-1"}/><span>Restart Conversation</span>
                    </button>
                </div> : undefined
            }
        </div>
        <div className={`flex p-2 bg-slate-300/50 ${props.inputContainerClassName}`}>
            <input className="text-input sm mr-1 flex-1" onKeyDown={onKeyDown} ref={inputRef} autoFocus={true}
                   type={"text"} onChange={onInputChange} value={currentInput}
                   placeholder={"Insert message and tap enter"}/>
            <button className="button-primary flex items-center pr-1 pl-2" disabled={props.isProcessing}
                    onClick={onSendButtonClick}>
                <span>Send</span>
                <PaperAirplaneIcon className={"w-4 ml-1"}/>
            </button>
        </div>
    </div>
}