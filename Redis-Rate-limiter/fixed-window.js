export async function isAllowed (userId,limit,windowSizeSeconds,redis){

    const nowInSeconds = Math.floor(Date.now()/1000); //converting epoch milisecond in second
    const windowId = Math.floor(nowInSeconds/windowSizeSeconds)
    const key = `rate_limit:${userId}:${windowId}`
	
    const currentCount = await redis.incr(key)
    // chcke and set TTL if it is first request in window
    if(currentCount === 1)
    {
        await redis.expire(key, windowSizeSeconds)
    }
    
    const windowEndTime = (windowId+1)*windowSizeSeconds
    const retryAfter = windowEndTime - nowInSeconds;
    
    if(currentCount<=limit)
        return { allowed : true}
    
    return {
        allowed: false,
        retryAfter: Math.max(retryAfter)
    }
}