const Database = require("better-sqlite3");

const path = require("path");

const db = new Database(
    path.join(__dirname, "payrollpro.db")
);
// Create employees table if it doesn't exist
db.prepare(`
    CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        department TEXT NOT NULL,
        designation TEXT NOT NULL,
        type TEXT NOT NULL,
        basicSalary REAL DEFAULT 0,
        hra REAL DEFAULT 0,
        da REAL DEFAULT 0,
        pf REAL DEFAULT 0,
        hoursWorked REAL DEFAULT 0,
        ratePerHour REAL DEFAULT 0
    )
`).run();

console.log("PayrollPro database connected successfully.");

module.exports = db;