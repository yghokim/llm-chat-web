import {Section} from "../components/Section";

export const AckSection = () => {
    return <Section title={"Acknowledgment"}>
        <p>
            <span>The chatbots run on <a href={"https://openai.com/"} target={"_blank" }><img src={require("../assets/logos/openai-white.png")} className={"h-5 inline mb-1 mx-1 opacity-90"}/></a> GPT-3 API.</span>
        </p>
    </Section>
}