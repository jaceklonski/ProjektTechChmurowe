const { exec } = require('child_process');
const path = require('path');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('No DB in .env');
  process.exit(1);
}

const backupFilePath = path.join(__dirname, 'backup.dump');

function backupData(filePath) {
  const command = `pg_dump --dbname="${databaseUrl}" --format=custom --file="${filePath}"`;
  console.log(`Backup: ${command}`);
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
    }
    console.log('Backup został wykonany pomyślnie.');
  });
}

function restoreData(filePath) {
  const command = `pg_restore --dbname="${databaseUrl}" --clean "${filePath}"`;
  console.log(`Recovery Error: ${command}`);
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Recovery Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
    }
    console.log('Recovery Complete.');
  });
}

const action = process.argv[2];
if (action === 'backup') {
  backupData(backupFilePath);
} else if (action === 'restore') {
  restoreData(backupFilePath);
} else {
  console.log('node backupRestore.js backup|restore');
}
