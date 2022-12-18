import {Section} from "../components/Section";
import React from "react";

const MEMBERS = [
    {
        portrait: require('../assets/portraits/jwei.jpg'),
        name: "Jing Wei*",
        affiliation: "Univ. of Melbourne",
        affiliation2: "*Intern @ NAVER"
    },
    {
        portrait: require('../assets/portraits/skim.jpg'),
        name: "Sungdong Kim",
        affiliation: "NAVER AI Lab",
        affiliation2: "Language Research"
    },
    {
        portrait: require('../assets/portraits/hjung.png'),
        name: "Hyunhoon Jung",
        affiliation: "NAVER CLOUD",
        affiliation2: "Conversational UX"
    },
    {
        portrait: require('../assets/portraits/yhkim.jpg'),
        name: "Young-Ho Kim",
        affiliation: "NAVER AI Lab",
        affiliation2: "HCI Research"
    }
]

export const AboutSection = () => {
    return <Section title={"About This Project"}>
        <div className={"flex items-start"}>
            <div className={"flex-1 max-w-[50%] pr-3"}>
                <p>This work is an internship project at NAVER AI Lab, done in collaboration across researchers in the
                    fields of Human-Computer Interaction and Natural Language Processing.
                </p>
                <div className={"mt-6 flex items-center opacity-90"}>
                    <img src={require("../assets/logos/naver-ai.png")} className={"h-9"}/>
                    <img src={require("../assets/logos/unimelb-white.png")} className={"h-12 ml-6"}/>
                </div>
            </div>
            <div className={"pl-3 flex items-baseline flex-wrap -m-3"}>
                {
                    MEMBERS.map((member, i) => {
                        return <div key={i} className={"m-3"}>
                            <img className={"w-20 rounded-[50%] border-[2px] border-gray-200/30 mb-2"}
                                 src={member.portrait}/>
                            <div className={"font-semibold"}>{member.name}</div>
                            <div className={"text-sm"}>{member.affiliation}</div>
                            {
                                member.affiliation2 != null ?
                                    <div className={"text-sm"}>{member.affiliation2}</div> : undefined
                            }
                        </div>
                    })
                }
            </div>
        </div>
    </Section>
}