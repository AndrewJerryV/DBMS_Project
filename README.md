**To use with the new database**
mysql -u root -p DBMS_Project < <project foler>\dbms_project_backup.sql



Download MySQl from https://dev.mysql.com/downloads/file/?id=542923<br>
Use default settings during installation<br>
MUST SET PASSWORD FOR MYSQL TO THIS - **password@123**<br>

In mysql run (before running the code):<br>
CREATE DATABASE DBMS_Project;<br>
USE DBMS_Project;<br>
CREATE TABLE users ( id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), email VARCHAR(100) );<br>
INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com'), ('Bob', 'bob@example.com');<br>

In command line of folder (before running the code):<br>
npm init -<br>
npm install express mysql2 cors<br>

To run:<br>
1.Start MySQL server<br>
2.Run **node server.js**<br>
3.Open index.html in browser<br>
