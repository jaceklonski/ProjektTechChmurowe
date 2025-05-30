const express = require('express');
const { PrismaClient } = require('@prisma/client');
const app = express();
const prisma = new PrismaClient();

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`; // testowe zapytanie
    res.status(200).send('OK');
  } catch (err) {
    res.status(500).send('Database connection failed');
  }
});
