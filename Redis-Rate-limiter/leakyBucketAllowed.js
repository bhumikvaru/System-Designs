export async function leakyBucketAllowed(
    userId,capacity,leakRatePerSec,redis
){
    const now = Date.now();
    const key = `leaky_bucket:${userId}`;
    const data = await redis.hGetAll(key);

    let level = parseFloat(data.level??"0");
    const lastUpdated = parseInt(data.lastUpdated?? now)

    const elaspsedSeconds = (now-lastUpdated)/1000;
    const leaked = elaspsedSeconds * leakRatePerSec;
    level = Math.max(0,level-leaked);
    
    if(level+1>capacity)
        return {allowed: false};
    level+=1;
    await redis.hSet(key,{
        level: level.toString(),
        lastUpdated: now.toString()
    })

    await redis.expire(key, Math.ceil(capacity/leakRatePerSec)+1)
    return {allowed:true}
}