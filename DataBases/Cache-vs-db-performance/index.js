const { createClient } = require('redis');
const { Client } = require('pg');

async function waitForService(checkFn, serviceName, maxAttempts = 80, interval = 2000) {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            await checkFn();
            console.log(`${serviceName} is ready`);
            return;
        } catch (err) {
            console.log(`Waiting for ${serviceName}... (${i + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    }
    throw new Error(`${serviceName} not ready after ${maxAttempts} attempts`);
}

async function testRedis(nOperations = 1000) {
    const client = createClient({
        url: 'redis://localhost:6379'
    });

    await waitForService(
        () => client.connect(),
        'Redis'
    );

    // Test SET operations
    const startSet = performance.now();
    for (let i = 0; i < nOperations; i++) {
        await client.set(`key${i}`, `value${i}`);
    }
    const setTime = performance.now() - startSet;

    // Test GET operations
    const startGet = performance.now();
    for (let i = 0; i < nOperations; i++) {
        await client.get(`key${i}`);
    }
    const getTime = performance.now() - startGet;

    await client.flushAll();
    await client.disconnect();
    return { setTime, getTime };
}

async function testPostgres(nOperations = 1000) {
    const client = new Client({
        database: 'testdb',
        user: 'user',
        password: 'password',
        host: 'localhost',
        port: 5436
    });

    await waitForService(
        () => client.connect(),
        'PostgreSQL'
    );

    await client.query(`
        CREATE TABLE IF NOT EXISTS kv_store (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    `);

    // Test INSERT operations
    const startInsert = performance.now();
    for (let i = 0; i < nOperations; i++) {
        await client.query('INSERT INTO kv_store (key, value) VALUES ($1, $2)', [`key${i}`, `value${i}`]);
    }
    const insertTime = performance.now() - startInsert;

    // Test SELECT operations
    const startSelect = performance.now();
    for (let i = 0; i < nOperations; i++) {
        await client.query('SELECT value FROM kv_store WHERE key = $1', [`key${i}`]);
    }
    const selectTime = performance.now() - startSelect;

    // Clean up
    await client.query('DROP TABLE kv_store');
    await client.end();
    return { insertTime, selectTime };
}

async function main() {
    const nOperations = 1000;
    console.log(`Running performance tests with ${nOperations} operations\n`);

    try {
        // Redis test
        console.log('Testing Redis...');
        const redisResults = await testRedis(nOperations);
        console.log(`Redis SET time: ${(redisResults.setTime / 1000).toFixed(3)} seconds`);
        console.log(`Redis GET time: ${(redisResults.getTime / 1000).toFixed(3)} seconds`);

        console.log('\nTesting PostgreSQL...');
        const postgresResults = await testPostgres(nOperations);
        console.log(`PostgreSQL INSERT time: ${(postgresResults.insertTime / 1000).toFixed(3)} seconds`);
        console.log(`PostgreSQL SELECT time: ${(postgresResults.selectTime / 1000).toFixed(3)} seconds`);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

main();