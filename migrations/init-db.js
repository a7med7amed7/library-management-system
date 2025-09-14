const mysql = require('mysql2/promise');
const config = require('../knexfile');

async function waitForDatabase(config, maxAttempts = 60) {
  console.log('host', config.host);
  console.log('user', config.user);
  console.log('password', config.password);
  console.log('database', config.database);
  console.log('config', { host: config.host, user: config.user, password: config.password });
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // First, try to connect to MySQL server without specifying database
      const connection = await mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        connectTimeout: 10000,
        acquireTimeout: 10000,
        timeout: 10000
      });
      
      console.log('Successfully connected to MySQL server');
      await connection.ping();
      console.log('MySQL server is responsive');
      await connection.end();
      return true;
    } catch (error) {
      console.log(`Attempt ${attempt}/${maxAttempts}: MySQL not ready yet...`);
      console.log('Error:', error.message);
      
      // Wait for 2 seconds before next attempt (increased from 1s)
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw new Error('Could not connect to MySQL server after maximum attempts');
}

async function createDatabase() {
  const environment = process.env.NODE_ENV || 'development';
  const { host, user, password, database } = config[environment].connection;
  
  try {
    console.log(`Attempting to connect to MySQL at ${host} with user ${user}`);
    
    // Wait for MySQL to be ready
    await waitForDatabase({ host, user, password, database });

    // Create connection without database first
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      connectTimeout: 15000,
      acquireTimeout: 15000,
      timeout: 15000
    });

    console.log('Connected to MySQL, checking/creating database...');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    console.log(`Database ${database} created or verified`);
    
    // Test connection to the specific database
    await connection.query(`USE \`${database}\``);
    console.log(`Successfully switched to database ${database}`);

    // Test a simple query
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('Database is working properly:', rows);

    await connection.end();
    console.log('Database initialization completed successfully');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    console.error('Error details:', {
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });
    throw error;
  }
}

// Execute if this script is run directly
if (require.main === module) {
  createDatabase()
    .then(() => {
      console.log('✅ Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to initialize database:', error.message);
      process.exit(1);
    });
}

exports.up = async () => await createDatabase();

exports.down = async () => {
  try {
    const environment = process.env.NODE_ENV || 'development';
    const { host, user, password, database } = config[environment].connection;
    
    const connection = await mysql.createConnection({ host, user, password });
    await connection.query(`DROP DATABASE IF EXISTS \`${database}\``);
    await connection.end();
  } catch (error) {
    console.error('Failed to drop database:', error);
    throw error;
  }
};