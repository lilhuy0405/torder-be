import * as cors from 'cors';
import { Express, Request } from "express";
import { AppDataSource } from './data-source';
const express = require('express')
import 'dotenv/config';
import 'reflect-metadata';

AppDataSource
  .initialize()
  .then(() => {
    console.log("Data Source has been initialized!")
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err)
  })

const app: Express = express()
app.use(cors());

app.get('/hello', async (req, res) => {
  try {
    res.status(200).send('Hello World!');
  } catch (err) {
    res.status(500).json({
      message: 'Cannot get dapps'
    })
  }
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`App listening on port ${port}`)

})