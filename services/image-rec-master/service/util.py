import sys

from termcolor import colored


async def get_int_list(redis, key):
    """Get a list of integers on redis."""
    str_list = await redis.lrange(key, 0, -1)
    int_list = [int(i) for i in str_list]

    return int_list


def print_error(type, message):
    text = colored(type + ': ', 'red', attrs=['bold']) + message
    print(text, file=sys.stderr)
