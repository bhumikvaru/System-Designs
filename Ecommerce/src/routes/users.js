const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");
const { dbWrite } = require("../db");


const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email, password requeired" });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const result = await dbWrite.query(
      `
            INSERT INTO users (name, email, phone, password_hash)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, email, phone, password_hash
        `,
      [name, email, phone || null, password_hash]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;