import React from 'react';
import './App.scss';
import {ChatbotPlayground} from "./components/ChatbotPlayground";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div>Leveraging Large Language Models to Power Chatbots for Collecting User Self-Reported Data</div>
      </header>
        <ChatbotPlayground/>
    </div>
  );
}

export default App;
