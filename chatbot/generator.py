from time import perf_counter
from abc import ABC, abstractmethod


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

        response = await self._get_response_impl(dialog)

        end = perf_counter()

        return response, int((end - start) * 1000)
