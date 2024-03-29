import "reflect-metadata"
import {DataSource} from "typeorm"
import 'dotenv/config';
import {Customer, Order, Product, User} from "./entity";
import ShippingUnit from "./entity/ShippingUnit";


export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: true,
  logging: false,
  schema: "public",
  entities: [Order, User, ShippingUnit, Product, Customer],
  subscribers: [],
})
