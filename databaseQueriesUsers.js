const mysql = require('mysql2/promise');


let connection;

async function getConnection() {
  if (!connection) {
    connection = await mysql.createConnection({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "",
      database: "HY359_2025",
    });
    console.log('MySQL connection established.');
  }
  return connection;
}


// New function to retrieve all users
async function getAllUsers() {
  try {
    const conn = await getConnection();
    const [rows] = await conn.query('SELECT * FROM users');
    return rows;
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}

async function getUserByCredentials(username, password) {
  const conn = await getConnection();

  // ψάχνω στους simple users
  let [rows] = await conn.execute(
    "SELECT *, 'user' AS type FROM users WHERE username=? AND password=?",
    [username, password]
  );

  if (rows.length > 0) {
    return rows;
  }

  //  αν δεν βρέθηκε user, ψάχνω στα bands
  [rows] = await conn.execute(
    "SELECT *, 'band' AS type FROM bands WHERE username=? AND password=?",
    [username, password]
  );

  return rows;
}



async function updateUser(username, newFirstname) {
  try {
    const conn = await getConnection();

    const updateQuery = `
      UPDATE users
      SET firstname = ?
      WHERE username = ?
    `;

    const [result] = await conn.execute(updateQuery, [newFirstname, username]);

    if (result.affectedRows === 0) {
      return 'No user found with that username.';
    }

    return 'Firstname updated successfully.';
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}

async function deleteUser(username) {
  try {
    const conn = await getConnection();

    const deleteQuery = `
      DELETE FROM users
      WHERE username = ?
    `;

    const [result] = await conn.execute(deleteQuery, [username]);

    if (result.affectedRows === 0) {
      return 'No user found with that username.';
    }

    return 'User deleted successfully.';
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}


module.exports = {getAllUsers, getUserByCredentials, updateUser, deleteUser};