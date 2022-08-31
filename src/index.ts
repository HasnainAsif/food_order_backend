import express from 'express';
require('dotenv').config();

import App from './services/ExpressApp';
import dbConnection from './services/Database';
import { PORT } from './config';

const startServer = async () => {
  const app = express();
  await dbConnection();

  await App(app);

  app.listen(PORT, () => {
    console.clear();
    console.log(`App is listening to the port ${PORT}...`);
  });
};

startServer();
