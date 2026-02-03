import {randomUUID} from "crypto"

export async function slidingWindowAllowed(
    userId,limit, windowSizeSeconds, redis
)
{
    const now = Date.now();
    const windowStart = now - windowSizeSeconds*1000;
    const key = `sliding_window:{userId}`;

    await redis.zRemRangeByScore(key,0,windowSizeSeconds)
    const requestCount = await redis.zCount(key,windowStart, now)
      if (requestCount >= limit) {
        const oldest = await redis.zRemRangeByScore(key,0, 0, {WITHSCORE: true})
        const oldestTimeStamp = Number(oldest[1]);
        const retryAfterMs = oldestTimeStamp + windowSizeSeconds*1000 -now;
        return{
            allowed: false,
            retryAfter: Math.ceil(retryAfterMs / 1000),
        }
    }
    await redis.zAdd(key,
        {
            score:now,
            value: randomUUID()
        }
    )
    await redis.expire(key, windowSizeSeconds+1)
    return {allowed: true}
}