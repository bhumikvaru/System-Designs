require('dotenv').config();
const express = require('express');
const {Pool} = require('pg');

const app = express();
app.use(express.json())

const primaryPool = new Pool({
    host: process.env.PRIMARY_DB_HOST,
    port: process.env.PRIMARY_DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})


const replicaPool = new Pool ({
    host: process.env.REPLICA_DB_HOST,
    port: process.env.REPLICA_DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

// write to primary 
app.post('/users', async(req, res) => {
    const {name, email} = req.body;
    try{
        const result = await primaryPool.query(
            'INSERT INTO users (name,email) VALUES ($1,$2) RETURNING *',
            [name,email]
        );
        res.json(result.rows[0]);
    }catch (err){
        res.status(500).json({error: err.message})
    }
})


// Read from replica
app.get('/users', async (req,res) =>{
    try {
        const result = await replicaPool.query('SELECT * FROM users');
        res.json(result.rows)
    }catch (err)
    {
        res.status(500).json({error: err.message})
    }
});

app.listen(6000,()=>{
    console.log('Node app running on port 6000')
})