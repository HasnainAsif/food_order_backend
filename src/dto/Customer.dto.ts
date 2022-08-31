import { IsEmail, Length } from 'class-validator';
import { FoodDoc } from '../models';

export class CreateCustomerInputs {
  //// if these enteries give us warnings. We need to add "strictPropertyInitialization": false, "experimentalDecorators": true in tsconfig.json file

  @IsEmail()
  email: string;

  //   @IsEmpty()
  @Length(7, 13)
  phone: string;

  @Length(6, 12)
  password: string;
}

export class CustomerloginInputs {
  @IsEmail()
  email: string;

  @Length(6, 12)
  password: string;
}

export class EditCustomerProfileInputs {
  @Length(3, 16)
  firstName: string;

  @Length(3, 16)
  lastName: string;

  @Length(3, 16)
  address: string;
}

export interface CustomerPayload {
  _id: string;
  email: string;
  verified: boolean;
}

export class OrderInputs {
  id: string;
  unit: number;
}

export interface CartItem {
  food: any;
  unit: number;
}
