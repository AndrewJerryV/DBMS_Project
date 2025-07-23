Download MySQl from https://dev.mysql.com/downloads/file/?id=542923
Use default settings during installation
MUST SET PASSWORD FOR MYSQL TO THIS - password@123

In mysql run (before running the code):
CREATE DATABASE DBMS_Project;
USE DBMS_Project;
CREATE TABLE users ( id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), email VARCHAR(100) );
INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com'), ('Bob', 'bob@example.com');

In command line of folder (before running the code):
npm init -y
npm install express mysql2 cors

To run:
1.Start MySQL server
2.Run **node server.js**
3.Open index.html in browser.
