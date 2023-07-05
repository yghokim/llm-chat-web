from os import path, getcwd, getenv

import openai
from dotenv import load_dotenv

from chatbot.chatbot import TurnTakingChatSession
from nanoid import generate as generate_id

from chatbot.generators.gpt3_generator import GPT3StaticPromptResponseGenerator
import asyncio

def _print_system_message(message: str):
    print(f"AI: {message}")


def _print_user_message(message: str):
    print(f"You: {message}")

async def run_chat_loop():
    session_id = generate_id()

    print(f"Start a chat session (id: {session_id}).")
    session = TurnTakingChatSession(session_id, GPT3StaticPromptResponseGenerator.from_yml("assets/gpt3-chatbots/diet-001.yml", None))

    _print_system_message(await session.initialize()) # Print initial message

    while True:
        user_message = input("You: ")
        system_message = await session.push_user_message(user_message)
        _print_system_message(system_message)


if __name__ == "__main__":

    #Init OpenAI API
    load_dotenv(path.join(getcwd(), ".env"))
    openai.api_key = getenv('OPENAI_API_KEY')

    asyncio.run(run_chat_loop())