import express from 'express';
import mongoose from 'mongoose';
import { MONGO_URI } from './config';

import { AdminRoute, VandorRoute } from './routes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/admin', AdminRoute);
app.use('/vandor', VandorRoute);

mongoose
  .connect(MONGO_URI)
  .then((result) => console.log('DB connected...'))
  .catch((err) => console.log('error: ', err));

app.listen(8000, () => {
  console.clear();
  console.log('App is listening to the port 8000...');
});
