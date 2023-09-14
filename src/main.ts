import * as cors from 'cors';
import {Express} from "express";
import {AppDataSource} from './data-source';
import 'dotenv/config';
import 'reflect-metadata';
import * as bodyParser from 'body-parser';

const express = require('express')


import apiRoute from "./route/api";

AppDataSource
  .initialize()
  .then(() => {
    console.log("Data Source has been initialized!")
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err)
  })

const app: Express = express()
//enable cors
app.use(cors());
app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}))
// public resources
app.use("/uploads", express.static('uploads'));
//define routes
app.use('/api/v1', apiRoute);

//start server
const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`App listening on port ${port}`)

})
