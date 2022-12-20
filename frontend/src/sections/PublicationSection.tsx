import {Section} from "../components/common/Section";
import ReactPrismjs from '@uiw/react-prismjs'
import 'prismjs-bibtex'
import 'prism-themes/themes/prism-solarized-dark-atom.css'

// eslint-disable-next-line no-multi-str
const BibTexO4R = "@inproceedings{wei2023llmchatbot,\n\
    title        = {{Leveraging Large Language Models to Power Chatbots for Collecting User Self-Reported Data}},\n\
    author       = {Wei, Jing and Kim, Sungdong and Jung, Hyunhoon and Kim, Young-Ho},\n\
    year         = {2022},\n\
}"

export const PublicationSection = () => {

    return <Section title={"Citing This Work"}>
        <p>
            The bootstrapping method of the self-reporting chatbots and a user study are described in
            our research paper:
        </p>
        <div className={"flex"}>
            <div className={"py-3 border-y-[1px] border-gray-100/20"}>
                <div>Jing Wei, Sungdong Kim, Hyunhoon Jung, and Young-Ho Kim. 2023.</div>
                <div className={"font-medium"}>Leveraging Large Language Models to Power Chatbots for Collecting User Self-Reported Data.</div>
            </div>
        </div>

        <h3 className={"mt-6"}>BibTeX</h3>
        <div className={"flex"}>
            <ReactPrismjs className={"decoration-none"} language={'bibtex'} source={BibTexO4R}/>
        </div>

    </Section>
}