import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// Create a MySQL pool with promise support
const db = mysql.createPool({
  host: process.env.HOST || 'localhost',
  user: process.env.USER || 'root',
  password: process.env.PASSWORD || '',
  database: process.env.DATABASE || 'drms_database', 
}).promise();

// Function to auto-create an admin account if it does not exist
async function createAdminAccount() {
  const adminUsername = 'admin';
  const adminPassword = 'admin123'; // You should hash this password in a real application
  const adminName = 'Administrator';
  const adminRole = 'admin';

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [adminUsername]);

    if (rows.length === 0) {
      await db.query(
        'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
        [adminUsername, adminPassword, adminName, adminRole]
      );
      console.log('Admin account created.');
    } else {
      console.log('Admin account already exists.');
    }
  } catch (error) {
    console.error('Error creating admin account:', error);
  }
}

// Call the function to create the admin account
createAdminAccount();

export default db;