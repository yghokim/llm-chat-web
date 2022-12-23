import {DEFAULT_PRESET_CONFIG, SessionConfig, SessionCustomConfig, SessionPresetConfig} from "../types";
import {ChangeEventHandler, MouseEventHandler, useCallback, useMemo, useRef, useState} from "react";
import {ArrowLeftIcon, CpuChipIcon, PaintBrushIcon} from "@heroicons/react/24/solid";
import isEqual from "react-fast-compare"
import {useDebounceCallback} from "@react-hook/debounce";
import {ComboBox} from "./common/ComboBox";
import {TooltipIndicator} from "./common/TooltipIndicator";

const MAX_TOKENS = 400

const MODELS = [
    "text-davinci-003",
    "text-davinci-002"
]

export const ConfigPanel = (props: {
    config: SessionConfig,
    onConfigUpdate: (newConfig: SessionConfig) => void,
    promptTemplate?: string
}) => {

    const [configMode, setConfigMode] = useState<"preset" | "custom">("preset")

    const [customConfigOnEdit, setCustomConfigOnEdit] = useState<SessionCustomConfig | undefined>(undefined)
    const [customConfigOnEditOriginal, setCustomConfigOnEditOriginal] = useState<SessionCustomConfig | undefined>(undefined)

    const [tokenCount, setTokenCount] = useState<number | undefined>(undefined)

    const isCustomConfigEdited = useMemo(() => {
        return !isEqual(customConfigOnEdit, customConfigOnEditOriginal)
    }, [customConfigOnEdit, customConfigOnEditOriginal])

    const promptTextAreaRef = useRef<HTMLTextAreaElement>(null)

    const updateTokenLength = useDebounceCallback(useCallback((text: string)=>{
        setTokenCount(undefined)
        fetch(process.env.REACT_APP_API_URL + '/api/v1/utils/count_tokens', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        }).then(response => response.json()).then(result => {
            setTokenCount(result)
        })
    }, []), 200, false)

    const onPromptTemplateEdit: ChangeEventHandler<HTMLTextAreaElement> = useCallback((ev) => {
        if (customConfigOnEdit) {
            setCustomConfigOnEdit({
                ...customConfigOnEdit,
                prompt_body: ev.target.value
            })
            updateTokenLength(ev.target.value)
        }
    }, [customConfigOnEdit, updateTokenLength])

    const onApplyButtonClick = useCallback(() => {
        if (customConfigOnEdit) {
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
                        model: props.config.model,
                        system_alias: "Me",
                        user_alias: "Customer"
                    }
                    const newConfigOrginal = JSON.parse(JSON.stringify(newConfig))

                    setCustomConfigOnEdit(newConfig)
                    setCustomConfigOnEditOriginal(newConfigOrginal)
                    setConfigMode("custom")

                    updateTokenLength(newConfig.prompt_body)
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

    const onModelSelected = useCallback((item: string) => {
                switch(configMode){
                    case "preset":
                        props.onConfigUpdate({
                            ...props.config,
                            model: item
                        })
                        break;
                    case "custom":
                        setCustomConfigOnEdit({
                            ...customConfigOnEdit!!,
                            model: item
                        })
                        break;
                }
            }, [configMode, customConfigOnEdit, props.onConfigUpdate, props.config])

    const onAgentAliasChange: ChangeEventHandler<HTMLInputElement> = useCallback((ev)=>{
        if(customConfigOnEdit!=null) {
            setCustomConfigOnEdit({
                ...customConfigOnEdit,
                system_alias: ev.target.value
            })
        }
    },[customConfigOnEdit])

    const onUserAliasChange: ChangeEventHandler<HTMLInputElement> = useCallback((ev)=>{
        if(customConfigOnEdit!=null) {
            setCustomConfigOnEdit({
                ...customConfigOnEdit,
                user_alias: ev.target.value
            })
        }
    },[customConfigOnEdit])


    return <div className="py-2 px-3 flex flex-col h-full">
        {
            configMode === "preset" ? <PresetConfigViewContent config={props.config as SessionPresetConfig}
                                                                 onConfigUpdate={props.onConfigUpdate}/> : undefined
        }
        <div className={"flex flex-row items-center justify-between my-2"}>
            <div className={"h3-style mt-1.5 flex items-center"}><span>Model</span> <TooltipIndicator id={"tt-model-name"} className={"ml-0"} tooltipText={"A language model used to generate responses."}/></div>
            <ComboBox data={MODELS} onChange={onModelSelected} value={configMode == "preset" ? props.config.model : customConfigOnEdit?.model}/>
        </div>
        <hr/>
        {
            configMode === 'custom' ? <div className={"flex flex-wrap items-center -m-2 pb-3"}>
                <div className={"flex items-center m-2"}>
                    <div className={"h3-style flex items-center"}>Agent Alias <TooltipIndicator id={"tt-agent-alias"} className={"ml-0"} tooltipText={"An alias for the agent used ONLY in the prompt."}/></div>
                    <input className={"text-input w-[6rem] sm ml-2 bg-white"} placeholder={"Me"}
                           value={customConfigOnEdit?.system_alias}
                           onChange={onAgentAliasChange}
                    />
                </div>
                <div className={"flex items-center m-2"}>
                    <div className={"h3-style flex items-center"}>User Alias <TooltipIndicator id={"tt-user-alias"} className={"ml-0"} tooltipText={"An alias for the user used ONLY in the prompt."}/></div>
                    <input className={"text-input w-[6rem] sm ml-2 bg-white"} placeholder={"Customer"}
                           value={customConfigOnEdit?.user_alias}
                           onChange={onUserAliasChange}
                    />
                </div>
            </div> : undefined
        }
        <h3>Prompt Template</h3>
        <textarea className={"w-full flex-1 font-mono text-xs resize-none bg-gray-700/90 rounded-md text-white p-2"}
                  ref={promptTextAreaRef}
                  data-gramm_editor="false"
                  value={configMode === "preset" ? props.promptTemplate : customConfigOnEdit?.prompt_body}
                  onChange={configMode === "custom" ? onPromptTemplateEdit : undefined}
                  disabled={configMode === "preset"}/>
        {
            configMode === 'custom' ? <div className={"text-xs mt-1 pr-1 text-right"}>
                Token count: <span className={`${tokenCount && tokenCount > MAX_TOKENS ? 'text-red-500 font-semibold' : undefined}`}>{tokenCount}</span>/{MAX_TOKENS}
            </div> : undefined
        }
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
                                                  disabled={!(configMode === "custom" && isCustomConfigEdited && tokenCount && tokenCount < MAX_TOKENS)}
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
        title: "Work",
        key: "work"
    },
    {
        icon: "",
        title: "Food Intake",
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

    return <><h3 className={"flex items-center"}><span>Topic</span> <TooltipIndicator id={"tt-topic"} className={"ml-0"}
                                         tooltipText={"The chatbot will carry on the conversation by asking questions regarding the given topic."}/></h3>
        <div className="flex flex-row justify-evenly -m-1">
            {
                TOPICS.map(topic => <button key={topic.key}
                                            id={"btn-topic-" + topic.key}
                                            onClick={onSelectionButtonClick}
                                            className={`flex-1 button-secondary m-1 ${props.config.type === "preset" && props.config.topic === topic.key ? 'selected' : undefined}`}>{topic.title}</button>)
            }
        </div>

        <div className="flex flex-row items-center py-3 mt-2">
            <div className={"h3-style flex-1"}>
                <span>Information Format</span>
                <TooltipIndicator id={"tt-format"} tooltipText={"In the Structured format, questions to ask are structured in an NLP-friendly format. In the Descriptive format, questions to ask are described as plain sentences."}/>
            </div>
            <div className={"button-group"}>
                <button id={"btn-format-structured"} onClick={onSelectionButtonClick}
                        className={`button-secondary flex items-center ${props.config.type === "preset" && props.config.format === "structured" ? 'selected' : undefined}`}>Structured
                </button>
                <button id={"btn-format-descriptive"} onClick={onSelectionButtonClick}
                        className={`button-secondary flex items-center ${props.config.type === "preset" && props.config.format === "descriptive" ? 'selected' : undefined}`}>Descriptive
                </button>
            </div>
        </div>
        <div className="flex flex-row items-center py-1">
            <div className={"h3-style flex-1"}>
                <span>Personality Modifier</span>
                <TooltipIndicator id={"tt-personality"} tooltipText={"With modifier, the instruction contains RICHER description of the agent's personality encouraging the EMPATHETIC behaviors."}/>
            </div>
            <div className={"button-group"}>
                <button id={"btn-modifier-true"} onClick={onSelectionButtonClick}
                        className={`button-secondary ${props.config.type === "preset" && props.config.modifier ? 'selected' : undefined}`}>With
                    modifier
                </button>
                <button id={"btn-modifier-false"} onClick={onSelectionButtonClick}
                        className={`button-secondary ${props.config.type === "preset" && props.config.modifier ? undefined : 'selected'}`}>No
                    modifier
                </button>
            </div>
        </div>
    </>
}