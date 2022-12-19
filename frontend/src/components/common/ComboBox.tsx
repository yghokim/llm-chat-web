import {Listbox, Transition} from "@headlessui/react"
import {ChevronUpDownIcon} from "@heroicons/react/24/solid"
import {Fragment} from "react"

export const ComboBox = (props: {
    data: Array<any>,
    getKey?: (item: any) => string,
    getLabel?: (item: any) => string,
    getUnavailable?: (item: any) => boolean,
    onChange: (item: any) => void,
    disabled?: boolean,
    value: any,
    className?: string,
    buttonClassName?: string
}) => {
    return <div className={`list-box w-[15rem] ${props.className || ""}`}>
        <Listbox disabled={props.disabled} value={props.value} onChange={props.onChange} as={"Component" as any}>
            <div className="relative mt-1">
                <Listbox.Button
                    className={`relative w-full py-2 pl-3 pr-10 text-left bg-white rounded-lg shadow-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-lime-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm font-semibold disabled:text-gray-300 normal-case ${props.buttonClassName || ""}`}
                    disabled={props.disabled}>

                    <span className="block truncate">
                        {props.value != null ? (props?.getLabel?.(props.value) || props.value) : "Not selected"}</span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <ChevronUpDownIcon
                            className="w-5 h-5 text-gray-400"
                            aria-hidden="true"
                        />
                    </span>
                </Listbox.Button>

                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Listbox.Options
                        className="absolute z-40 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {
                            props.data.map(item =>
                                <Listbox.Option
                                    className={({active}) =>
                                        `cursor-default select-none relative py-2 pl-4 pr-4 normal-case ${active ? 'text-lime-900 bg-lime-200' : 'text-gray-900'
                                        }`
                                    }
                                    key={props?.getKey?.(item) || item} value={item}
                                    disabled={props?.getUnavailable?.(item) === true}><span
                                    className={props?.getUnavailable?.(item) === true ? 'text-gray-400' : undefined}>{props?.getLabel?.(item) || item}</span></Listbox.Option>)
                        }
                    </Listbox.Options>
                </Transition>
            </div>
        </Listbox>
    </div>

}