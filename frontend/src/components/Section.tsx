export const Section = (props: {
    title: string,
    children?: any
}) => {
    return <div className={"content-section container mx-auto px-8 mt-16 text-white"}>
        <div className={"text-white font-light text-3xl mb-2"}>{props.title}</div>
        {
            props.children
        }
    </div>
}