import * as cors from 'cors';
import { Express, Request } from "express";
import { AppDataSource } from './data-source';
const express = require('express')
import 'dotenv/config';
import 'reflect-metadata';
import { User } from './entity';
import { UserService, OrderService } from './service';
import * as bcrypt from 'bcrypt';
import * as auth from './middleware/auth'
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
app.use(express.json())
// declar services
const userService = new UserService()
const orderService = new OrderService()

app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    const user = new User()
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please fill all fields'
      })
    }
    //hash password
    const salt = await bcrypt.genSalt(10)
    const hashPwd = await bcrypt.hash(password, salt)

    user.name = name
    user.email = email
    user.password = hashPwd
    user.role = 'user'

    const newUser = await userService.createUser(user)
    res.status(201).json({
      message: 'Register success',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (err) {
    res.status(500).json({
      message: 'Register failed ' + err.message
    })
  }
})

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please fill all fields'
      })
    }
    const user = await userService.findUserByEmail(email)
    if (!user) {
      return res.status(400).json({
        message: 'Email not found'
      })
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid credentials'
      })
    }
    const token = user.generateJwt()
    res.status(200).json({
      message: 'Login success',
      data: {
        accessToken: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    })

  } catch (err) {
    res.status(500).json({
      message: 'Login failed ' + err.message
    })
  }
})


app.get('/me', auth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const user = await userService.findUserById(loggedInUser.id)
    res.status(200).json({
      message: 'Get user success',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })

  } catch (err) {
    res.status(500).json({
      message: 'Get users failed ' + err.message
    })
  }
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`App listening on port ${port}`)

})