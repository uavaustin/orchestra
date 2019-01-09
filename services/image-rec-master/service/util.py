async def get_int_list(redis, key):
    """Get a list of integers on redis."""
    str_list = await redis.lrange(key, 0, -1)
    int_list = [int(i) for i in str_list]

    return int_list


async def get_int_set(redis, key):
    """Get a set of integers on redis."""
    str_set = await redis.smembers(key)
    int_set = [int(i) for i in str_set]

    return int_set
