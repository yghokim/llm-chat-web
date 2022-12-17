import {DialogTurn} from "../types";
import {ChangeEvent, useCallback, useRef, useState} from "react";
import {useDebounceCallback} from "@react-hook/debounce";

export const ChatPanel = (props: {
    className?: string,
    dialog: Array<DialogTurn>,
    isProcessing: boolean,
    onUserNewMessage: (message: string) => void
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

    return <div className={props.className}>
        <div ref={scrollViewRef} className="flex-1 overflow-y-auto py-3">
                    {
                        props.dialog.map((turn, i) => {
                            return <div className={`turn-container ${turn.is_user ? "user" : "system"}`} key={i}>
                            <span className="callout">
                                {turn.message}
                            </span>
                            </div>
                        })
                    }
                    {
                        props.isProcessing && <span className="turn-container block">
                            <span className="callout w-auto bg-slate-300 animate-pulse">...</span>
                        </span>
                    }
                </div>
                <div className="flex p-2 bg-slate-300/50">
                    <input className="text-input sm mr-1 flex-1" onKeyDown={onKeyDown} ref={inputRef} autoFocus={true}
                        type={"text"} onChange={onInputChange} value={currentInput}/>
                    <button className="button-primary" disabled={props.isProcessing} onClick={onSendButtonClick}>Send</button>
                </div>
    </div>
}