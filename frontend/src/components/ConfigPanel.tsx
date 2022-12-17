import {SessionConfig} from "../types";
import {MouseEventHandler, useCallback} from "react";

const TOPICS = [
    {
        icon: "",
        title: "Sleep",
        key:"sleep"
    },
    {
        icon: "",
        title: "Exercise",
        key:"exercise"
    },
    {
        icon: "",
        title: "Work & Productivity",
        key:"work"
    },
    {
        icon: "",
        title: "Food intake",
        key:"diet"
    },
]

export const ConfigPanel = (props: {config: SessionConfig, onConfigUpdate:(newConfig: SessionConfig)=>void}) => {

    const onSelectionButtonClick: MouseEventHandler<HTMLButtonElement>  = useCallback((ev) => {
        const buttonId: string = (ev.nativeEvent.target as any)["id"]
        const buttonIdSplit = buttonId.split("-")

        switch(buttonIdSplit[1]){
            case "topic":
                const topicKey = buttonIdSplit[buttonIdSplit.length - 1]
                if(props.config.type === "preset" && props.config.topic !== topicKey){
                    props.onConfigUpdate({
                        ...props.config,
                        topic: topicKey as any
                    })
                }
                break;


            case "format":
                const format = buttonIdSplit[buttonIdSplit.length - 1]
                if(props.config.type === "preset" && props.config.format !== format){
                    props.onConfigUpdate({
                        ...props.config,
                        format: format as any
                    })
                }
                break;

            case "modifier":
                const modifier = buttonIdSplit[buttonIdSplit.length - 1] === "true"
                if(props.config.type === "preset" && props.config.modifier !== modifier){
                    props.onConfigUpdate({
                        ...props.config,
                        modifier
                    })
                }
                break;
        }



    }, [props.config, props.onConfigUpdate])

    return <div className="py-2 px-3">
        <h3>Topic</h3>
        <div className="flex flex-row justify-evenly -m-1">
            {
                TOPICS.map(topic => <button key={topic.key}
                                            id={"btn-topic-" + topic.key}
                                            onClick={onSelectionButtonClick}
                                            className={`flex-1 button-secondary m-1 ${props.config.type === "preset" && props.config.topic === topic.key ? 'selected' : undefined}`}>{topic.title}</button>)
            }
        </div>

        <div className="flex flex-row items-center py-3 mt-2">
            <div className={"h3-style flex-1"}>Information Format</div>
            <button id={"btn-format-specific"} onClick={onSelectionButtonClick} className={`button-secondary ${props.config.type === "preset" && props.config.format === "specific" ? 'selected' : undefined}`}>Specific</button>
            <button id={"btn-format-descriptive"} onClick={onSelectionButtonClick} className={`button-secondary ml-2 ${props.config.type === "preset" && props.config.format === "descriptive" ? 'selected' : undefined}`}>Descriptive</button>
        </div>
        <div className="flex flex-row items-center py-3">
            <div className={"h3-style flex-1"}>Personality Modifier</div>
            <button id={"btn-modifier-true"} onClick={onSelectionButtonClick} className={`button-secondary ${props.config.type === "preset" && props.config.modifier ? 'selected' : undefined}`}>With modifier</button>
            <button id={"btn-modifier-false"} onClick={onSelectionButtonClick} className={`button-secondary ml-2 ${props.config.type === "preset" && props.config.modifier ? undefined : 'selected'}`}>No modifier</button>
        </div>
        <hr/>
    </div>
}