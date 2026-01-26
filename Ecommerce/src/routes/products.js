const express = require("express");
const { dbRead } = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
    try{
        const result = await dbRead.query(
            `SELECT id, name, description, image_url, price, total_stock, reserved_stock, status
            FROM products
            WHERE status = 'in_stock'
            ORDER BY id DESC
            `
        )
                const dbg = await dbRead.query("SELECT pg_is_in_recovery() AS is_replica");
                console.log("products read replica?", dbg.rows[0].is_replica);
        return res.json({products: result.rows});


    }
    catch(err){
        console.error(err);
        return res.status(500).json({message: "Internal server error"});
    }
})

module.exports =router;