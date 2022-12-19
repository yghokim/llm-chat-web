from time import perf_counter
from abc import ABC, abstractmethod

from backend.core.event import AsyncSubject, AsyncBehaviorSubject


class RegenerateRequestException(Exception):
    def __iit__(self, reason: str):
        self.reason = reason


class DialogTurn:
    def __init__(self, message: str, is_user: bool = True):
        self.message = message
        self.is_user = is_user


class ResponseGenerator(ABC):

    def initialize(self):
        pass

    @abstractmethod
    async def _get_response_impl(self, dialog: list[DialogTurn]) -> str:
        pass

    async def get_response(self, dialog: list[DialogTurn]) -> tuple[str, int]:
        start = perf_counter()

        try:
            response = await self._get_response_impl(dialog)
        except RegenerateRequestException as regen:
            print(f"Regenerate response. Reason: {regen.reason}")
            response = await self._get_response_impl(dialog)
        except Exception as ex:
            raise ex

        end = perf_counter()

        return response, int((end - start) * 1000)


class ChatSession():

    def __init__(self, response_generator: ResponseGenerator):
        self._response_generator = response_generator
        self._dialog: list[DialogTurn] = []
        self._on_new_message: AsyncSubject[DialogTurn] = AsyncSubject()
        self._on_is_processing: AsyncBehaviorSubject[bool] = AsyncBehaviorSubject(False)

    async def initialize(self):
        self._dialog.clear()
        initial_message, elapsed = await self._response_generator.get_response(self._dialog)
        await self._push_new_turn(DialogTurn(initial_message, is_user=False))
        await self._on_is_processing.on_next(False)

    def dispose(self):
        self._on_is_processing.dispose()
        self._on_new_message.dispose()

    @property
    def is_processing(self):
        return self._on_is_processing.value

    @property
    def on_new_message(self) -> AsyncSubject:
        return self._on_new_message

    @property
    def on_is_processing(self) -> AsyncBehaviorSubject:
        return self._on_is_processing

    @property
    def dialog(self):
        return self._dialog.copy()

    async def _push_new_turn(self, turn: DialogTurn):
        self._dialog.append(turn)
        await self._on_new_message.on_next(turn)

    async def push_user_message(self, message: str):
        await self._push_new_turn(DialogTurn(message, is_user=True))
        await self._on_is_processing.on_next(True)
        system_message, elapsed = await self._response_generator.get_response(self._dialog)
        await self._push_new_turn(DialogTurn(system_message, is_user=False))
        await self._on_is_processing.on_next(False)

    async def regen_system_message(self) -> bool:
        if len(self._dialog) > 2 and self._dialog[len(self._dialog) - 1].is_user is False:
            await self._on_is_processing.on_next(True)
            self._dialog.pop()
            system_message, elapsed = await self._response_generator.get_response(self._dialog)
            await self._push_new_turn(DialogTurn(system_message, is_user=False))
            await self._on_is_processing.on_next(False)

            return True
        else:
            return False
