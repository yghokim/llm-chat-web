import {Section} from "../components/common/Section";
import { ReactComponent as SlotByQuestion } from '../assets/fig_slot_by_question.svg';

export const UserStudySection = () => {
    return <Section title={"User Study"}>
        <p className={"max-w-4xl"}>We conducted an online user study (<i>N</i> = 48) to assess the data compliance and chatbot behaviors. Overall, the chatbots covered 79% of the desired
information slots among all dialogues.</p>
        <SlotByQuestion width={"100%"} className={"max-w-4xl"}/>
    </Section>
}