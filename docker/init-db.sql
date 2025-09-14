-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS library_management;

-- Use the database
USE library_management;

-- Grant permissions to the user
GRANT ALL PRIVILEGES ON library_management.* TO 'root'@'%';
FLUSH PRIVILEGES;
