import React from 'react';
import './App.scss';
import {ChatbotPlayground} from "./components/ChatbotPlayground";
import {AboutSection} from "./sections/AboutSection";
import {PublicationSection} from "./sections/PublicationSection";
import {AckSection} from "./sections/AckSection";

function App() {
    return (
        <div className="App h-screen flex flex-col justify-between">
            <div className={"mb-auto pb-12"}>
                <header className="App-header container mx-auto p-5">
                    <div className={"w-[70%] mx-auto font-semibold text-center text-white text-2xl"}>Leveraging Large
                        Language Models to Power Chatbots for Collecting User Self-Reported Data
                    </div>
                </header>
                <ChatbotPlayground/>
                <AboutSection/>
                <PublicationSection/>
                <AckSection/>
            </div>

            <div className={"bg-white/10 p-3"}>
                <div className={"container mx-auto text-white text-sm text-center"}>Copyright 2022-2023 NAVER AI Lab. All Rights Reserved.</div>
            </div>
            <div className="background-panel fixed top-0 left-0 right-0 bottom-0 z-[-1] pointer-events-none"/>
        </div>
    );
}

export default App;
