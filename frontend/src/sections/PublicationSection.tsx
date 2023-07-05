import {Section} from "../components/common/Section";
import ReactPrismjs from '@uiw/react-prismjs'
import 'prismjs-bibtex'
import 'prism-themes/themes/prism-solarized-dark-atom.css'

// eslint-disable-next-line no-multi-str
const BibTexO4R = "@inproceedings{wei2023llmchatbot,\n\
    title={Leveraging Large Language Models to Power Chatbots for Collecting User Self-Reported Data}, \n\
    author={Jing Wei and Sungdong Kim and Hyunhoon Jung and Young-Ho Kim},\n\
    year={2023},\n\
    eprint={2301.05843},\n\
    archivePrefix={arXiv},\n\
    primaryClass={cs.HC},\n\
    url={https://doi.org/10.48550/arXiv.2301.05843},\n\
    doi={arXiv:2301.05843}\n\
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
                <a className={"text-orange-300"} href={"https://arxiv.org/abs/2301.05843"} target={"_blank"} rel="noreferrer">https://arxiv.org/abs/2301.05843</a>
            </div>
        </div>

        <h3 className={"mt-6"}>BibTeX</h3>
        <div className={"flex"}>
            <ReactPrismjs className={"decoration-none"} language={'bibtex'} source={BibTexO4R}/>
        </div>

    </Section>
}