require('dotenv').config();
const { Pool } = require('pg');

async function testConnection() {
  console.log("Testing DB connection using separate variables...");

  // Using individual env variables
  const pool1 = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await pool1.connect();
    console.log("✅ Connection successful with separate variables!");
  } catch (err) {
    console.error("❌ Connection failed with separate variables:", err.message);
  } finally {
    await pool1.end();
  }

  console.log("\nTesting DB connection using DATABASE_URL...");

  // Using DATABASE_URL
  if (process.env.DATABASE_URL) {
    const pool2 = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    try {
      await pool2.connect();
      console.log("✅ Connection successful with DATABASE_URL!");
    } catch (err) {
      console.error("❌ Connection failed with DATABASE_URL:", err.message);
    } finally {
      await pool2.end();
    }
  } else {
    console.log("No DATABASE_URL found in .env, skipping this test.");
  }
}

testConnection();
