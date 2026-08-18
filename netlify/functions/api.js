const serverless = require('serverless-http');
const app = require('../../app');
const db = require('../../db');

const handler = serverless(app);

exports.handler = async (event, context) => {
  try {
    return await handler(event, context);
  } finally {
    db.closePool();
  }
};