import React from 'react';
import './App.scss';
import {ChatbotPlayground} from "./components/ChatbotPlayground";

function App() {
  return (
    <div className="App">
      <header className="App-header container mx-auto p-3">
        <div className={"w-[70%] mx-auto font-semibold text-center text-white text-2xl"}>Leveraging Large Language Models to Power Chatbots for Collecting User Self-Reported Data</div>
      </header>
        <ChatbotPlayground/>
        <div className="background-panel fixed top-0 left-0 right-0 bottom-0 z-[-1] pointer-events-none"/>
    </div>
  );
}

export default App;
