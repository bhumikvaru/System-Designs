const { Pool } = require("pg");
require("dotenv").config();

const dbWrite = new Pool({
  connectionString: process.env.DATABASE_URL_WRITE,
});

const dbRead = new Pool({
  connectionString: process.env.DATABASE_URL_READ,
});

module.exports = { dbWrite, dbRead };
