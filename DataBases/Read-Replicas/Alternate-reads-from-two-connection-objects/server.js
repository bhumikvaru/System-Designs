const express = require('express');
const {Pool} = require('pg');

const app = express();
const port = 3001;


const db1Pool = new Pool({
    user: 'user',
    host: 'localhost',
    database: 'testdb',
    password:'password',
    port:5433
});

const db2Pool = new Pool({
    user: 'user',
    host: 'localhost',
    database: 'testdb',
    password:'password',
    port:5434
});


app.use(express.json());
//round robin counter to alternate connection between DB
let queryCounter = 0;

app.get('/users', async (req,res)=>{
    try{
        const db = queryCounter % 2 === 0 ? db1Pool: db2Pool;
        const dbName = queryCounter % 2 === 0? 'DB1':'DB2';
        queryCounter++;

        const result = await db.query('SELECT * from users');
            res.json({
            source: dbName,
            data: result.rows,
            });
        }
        catch (err){
            console.log(err.stack)
            res.status(500).json({error: 'Database query failed'})
        }
    
})


app.listen(port,()=>{
    console.log(`Server running on http://localhost:${port}`);
})

process.on('SIGTERM', async()=>{
    console.log('Shutting down...');
    await db1Pool.end();
    await db2Pool.end();
    process.exit(0);
})