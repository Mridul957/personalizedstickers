const pg = require("pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set!");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

async function run() {
  try {
    console.log("Deleting default stickers 1-30 from Supabase...");
    const deleteRes = await pool.query("DELETE FROM stickers WHERE id <= 30");
    console.log(`Successfully deleted ${deleteRes.rowCount} default stickers.`);
    
    const selectRes = await pool.query("SELECT id, name, enabled FROM stickers ORDER BY id ASC");
    console.log("Current stickers in Supabase database after deletion:");
    console.log(JSON.stringify(selectRes.rows, null, 2));
  } catch (err) {
    console.error("Error cleaning up database stickers:", err);
  } finally {
    await pool.end();
  }
}

run();
