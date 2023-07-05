# Demo Code for Powering Self-Reporting Chatbots with Large Language Models (LLMs)
A unified LLM-driven chatbot framework written in python

## Paper
**Leveraging Large Language Models to Power Chatbots for Collecting User Self-Reported Data**

Jing Wei, Sungdong Kim, Hyunhoon Jung, Young-Ho Kim
https://arxiv.org/abs/2301.05843

## Live Demo
Live demo at https://naver-ai.github.io/llm-chatbot/

## How to Run

### (Prerequisite) Set OpenAI API Key
Create a `.env` file in the root directory and set OPENAI_API_KEY variable:
```sh
OPENAI_API_KEY=PASTE_YOUR_API_KEY
```

### Running a web version

#### Development mode:
```sh
> sh run-server-debug.sh
```

#### Production mode:
```sh
> sh run-server-production.sh
```
