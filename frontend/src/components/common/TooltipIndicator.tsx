import {Tooltip} from "react-tooltip";
import {QuestionMarkCircleIcon} from "@heroicons/react/20/solid";

export const TooltipIndicator = (props: {
    id: string,
    darkMode?: boolean,
    className?: string,
    tooltipText?: string
    children?: any
}) => {

    return <>
        <QuestionMarkCircleIcon
            className={`${props.darkMode === true ? "text-white hover:text-white/70" : "text-slate-400 hover:text-slate-300"} rounded-full w-[1.1rem] text-sm inline-block text-center cursor-pointer ${props.className}`}
            id={props.id}
        />
        <Tooltip anchorId={props.id} content={props.tooltipText} className={"max-w-sm"}>
            {props.children}
        </Tooltip>
    </>
}