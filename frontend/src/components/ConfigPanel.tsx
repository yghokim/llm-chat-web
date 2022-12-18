import {DEFAULT_PRESET_CONFIG, SessionConfig, SessionCustomConfig, SessionPresetConfig} from "../types";
import {ChangeEventHandler, MouseEventHandler, useCallback, useMemo, useRef, useState} from "react";
import {ArrowLeftIcon, CpuChipIcon, PaintBrushIcon} from "@heroicons/react/24/solid";
import isEqual from "react-fast-compare"

export const ConfigPanel = (props: {
    config: SessionConfig,
    onConfigUpdate: (newConfig: SessionConfig) => void,
    promptTemplate?: string
}) => {

    const [configMode, setConfigMode] = useState<"preset" | "custom">("preset")

    const [customConfigOnEdit, setCustomConfigOnEdit] = useState<SessionCustomConfig | undefined>(undefined)
    const [customConfigOnEditOriginal, setCustomConfigOnEditOriginal] = useState<SessionCustomConfig | undefined>(undefined)

    const isCustomConfigEdited = useMemo(() => {
        return !isEqual(customConfigOnEdit, customConfigOnEditOriginal)
    }, [customConfigOnEdit, customConfigOnEditOriginal])

    const promptTextAreaRef = useRef<HTMLTextAreaElement>(null)

    const onPromptTemplateEdit: ChangeEventHandler<HTMLTextAreaElement> = useCallback((ev) => {
        if (customConfigOnEdit) {
            setCustomConfigOnEdit({
                ...customConfigOnEdit,
                prompt_body: ev.target.value
            })
        }
    }, [customConfigOnEdit])

    const onApplyButtonClick = useCallback(() => {
        if(customConfigOnEdit) {
            setCustomConfigOnEditOriginal(JSON.parse(JSON.stringify(customConfigOnEdit)))
            props.onConfigUpdate(customConfigOnEdit)
        }
    }, [customConfigOnEdit, props.onConfigUpdate])

    const onModeButtonClick = useCallback(() => {
        switch (configMode) {
            case "preset":
                if (props.promptTemplate != null) {
                    const newConfig: SessionCustomConfig = {
                        type: "custom",
                        prompt_body: props.promptTemplate,
                        model: props.config.model
                    }
                    const newConfigOrginal = JSON.parse(JSON.stringify(newConfig))

                    setCustomConfigOnEdit(newConfig)
                    setCustomConfigOnEditOriginal(newConfigOrginal)
                    setConfigMode("custom")
                    requestAnimationFrame(() => {
                        promptTextAreaRef.current?.focus()
                    })
                }
                break;
            case "custom":
                props.onConfigUpdate(DEFAULT_PRESET_CONFIG)
                setCustomConfigOnEditOriginal(undefined)
                setCustomConfigOnEdit(undefined)
                setConfigMode("preset")
                break;
        }
    }, [configMode, props.onConfigUpdate, props.promptTemplate, props.config])

    return <div className="py-2 px-3 flex flex-col h-full">
        {
            configMode === "preset" ? <><PresetConfigViewContent config={props.config as SessionPresetConfig}
                                                                 onConfigUpdate={props.onConfigUpdate}/>
                    <hr/>
                </> :
                undefined
        }
        <h3>Prompt Template</h3>
        <textarea className={"w-full flex-1 font-mono text-xs resize-none bg-gray-700/90 rounded-md text-white p-2"}
                  ref={promptTextAreaRef}
                  value={configMode === "preset" ? props.promptTemplate : customConfigOnEdit?.prompt_body}
                  onChange={configMode === "custom" ? onPromptTemplateEdit : undefined}
                  disabled={configMode === "preset"}/>
        <div className={`mt-2 flex ${configMode === "custom" ? "justify-between" : "justify-end"}`}>
            <button className={`button-secondary flex items-center`} onClick={onModeButtonClick}>
                {
                    configMode === "preset" ? <>
                        <PaintBrushIcon className={"w-4 mr-1"}/>
                        <span>Try your own template!</span></> : <>
                        <ArrowLeftIcon className={"w-4 mr-1"}/>
                        <span>Back to Presets</span></>
                }

            </button>
            {
                configMode === 'custom' ? <button className={"button-secondary flex items-center"}
                                                  disabled={!(configMode === "custom" && isCustomConfigEdited)}
                                                  onClick={onApplyButtonClick}>
                    <CpuChipIcon className={"w-5 mr-1"}/>
                    <span>Apply to Chatbot!</span>
                </button> : undefined
            }
        </div>

    </div>
}


const TOPICS = [
    {
        icon: "",
        title: "Sleep",
        key: "sleep"
    },
    {
        icon: "",
        title: "Exercise",
        key: "exercise"
    },
    {
        icon: "",
        title: "Work & Productivity",
        key: "work"
    },
    {
        icon: "",
        title: "Food intake",
        key: "diet"
    },
]

const PresetConfigViewContent = (props: {
    config: SessionPresetConfig,
    onConfigUpdate: (newConfig: SessionConfig) => void
}) => {


    const onSelectionButtonClick: MouseEventHandler<HTMLButtonElement> = useCallback((ev) => {
        const buttonId: string = (ev.nativeEvent.target as any)["id"]
        const buttonIdSplit = buttonId.split("-")

        switch (buttonIdSplit[1]) {
            case "topic":
                const topicKey = buttonIdSplit[buttonIdSplit.length - 1]
                if (props.config.type === "preset" && props.config.topic !== topicKey) {
                    props.onConfigUpdate({
                        ...props.config,
                        topic: topicKey as any
                    })
                }
                break;


            case "format":
                const format = buttonIdSplit[buttonIdSplit.length - 1]
                if (props.config.type === "preset" && props.config.format !== format) {
                    props.onConfigUpdate({
                        ...props.config,
                        format: format as any
                    })
                }
                break;

            case "modifier":
                const modifier = buttonIdSplit[buttonIdSplit.length - 1] === "true"
                if (props.config.type === "preset" && props.config.modifier !== modifier) {
                    props.onConfigUpdate({
                        ...props.config,
                        modifier
                    })
                }
                break;
        }


    }, [props.config, props.onConfigUpdate])

    return <><h3>Topic</h3>
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
            <button id={"btn-format-specific"} onClick={onSelectionButtonClick}
                    className={`button-secondary ${props.config.type === "preset" && props.config.format === "specific" ? 'selected' : undefined}`}>Specific
            </button>
            <button id={"btn-format-descriptive"} onClick={onSelectionButtonClick}
                    className={`button-secondary ml-2 ${props.config.type === "preset" && props.config.format === "descriptive" ? 'selected' : undefined}`}>Descriptive
            </button>
        </div>
        <div className="flex flex-row items-center py-3">
            <div className={"h3-style flex-1"}>Personality Modifier</div>
            <button id={"btn-modifier-true"} onClick={onSelectionButtonClick}
                    className={`button-secondary ${props.config.type === "preset" && props.config.modifier ? 'selected' : undefined}`}>With
                modifier
            </button>
            <button id={"btn-modifier-false"} onClick={onSelectionButtonClick}
                    className={`button-secondary ml-2 ${props.config.type === "preset" && props.config.modifier ? undefined : 'selected'}`}>No
                modifier
            </button>
        </div>
    </>
}