import {Section} from "../components/Section";

export const PublicationSection = () => {
    return <Section title={"Citing This Work"}>
        <p>
            The bootstrapping method of the self-reporting chatbots and a user study are described in
            our research paper published at <a href={"https://chi2023.acm.org/"} target={"_blank"} rel="noreferrer"><b>ACM CHI 2023</b></a>.
        </p>
        <div className={"flex"}>
            <div className={"py-3 border-y-[1px] border-gray-100/20"}>
                <div>Jing Wei, Sungdong Kim, Hyunhoon Jung, and Young-Ho Kim. 2023.</div>
                <div className={"font-medium"}>Leveraging Large Language Models to Power Chatbots for Collecting User Self-Reported Data.</div>
                <div>In Proceedings of The ACM CHI Conference on Human Factors in Computing Systems 2023 (CHI'23). To appear.</div>
            </div>
        </div>

        <h3 className={"mt-6"}>BibTeX</h3>

    </Section>
}