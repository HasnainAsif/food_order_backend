import express, { Application } from 'express';
import path from 'path';

import { AdminRoute, ShoppingRoute, vendorRoute } from '../routes';
import { CustomerRoute } from '../routes/CustomerRoute';

export default async (app: Application) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('images', express.static(path.join(__dirname, 'images')));

  app.use('/admin', AdminRoute);
  app.use('/vendor', vendorRoute);
  app.use('/customer', CustomerRoute);
  app.use(ShoppingRoute);

  return app;
};
