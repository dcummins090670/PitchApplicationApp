/* use this code only for postgreSQL -- */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
 connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase SSL connections
  },
});

pool.connect()
  .then(() => console.log('Connected to Supabase PostgreSQL'))
  .catch(err => console.error('Database connection failed:', err));

 
module.exports = pool;
