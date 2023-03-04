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
import * as multer from 'multer';
import upload from './middleware/upload';
import * as bodyParser from 'body-parser';
import Order from './entity/Order';
import Excel = require('exceljs');
import uploadFileMiddleware from './middleware/upload';

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
app.use(bodyParser.urlencoded({ extended: true }))

// declar services
const userService = new UserService()
const orderService = new OrderService()
// public resources
app.use("/uploads", express.static('uploads'));

// routers and controllers
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

app.get('/health', async (req, res) => {
  res.status(200).json({
    message: 'Server torder is running'
  })
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

app.post("/upload-orders", [auth], async (req, res) => {
  try {
    await uploadFileMiddleware(req, res)
    const { shipCodeColumn, phoneColumn, productColumn, customerNameColumn, dataStartRow } = req.body;
    if (!shipCodeColumn || !phoneColumn || !productColumn || !customerNameColumn || !dataStartRow) {
      return res.status(400).json({
        message: 'Please fill all fields'
      })
    }

    console.log(req.file);
    console.log({ shipCodeColumn, phoneColumn, productColumn, customerNameColumn, dataStartRow });

    const fileExtension = req.file.originalname.split('.').pop();
    if (fileExtension !== 'xlsx') {
      return res.status(400).json({
        message: 'File format is not supported'
      })
    }

    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile('uploads/' + req.file.filename);
    const worksheet = workbook.getWorksheet(1);
    const listOrder = [];
    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      if (rowNumber >= dataStartRow) {
        const shipCode = row.getCell(shipCodeColumn).value;
        const phone = row.getCell(phoneColumn).value;
        const product = row.getCell(productColumn).value;
        const customerName = row.getCell(customerNameColumn).value;
        if (shipCode && phone && product && customerName) {
          listOrder.push({
            shipCode,
            phone,
            product,
            customerName
          })
        }
      }
    });
    //save to db
    const savedOrders = await Promise.all(listOrder.map(async (order) => {
      try {
        const newOrder = new Order()
        newOrder.shipCode = order.shipCode
        newOrder.phoneNumber = order.phone
        newOrder.product = order.product
        newOrder.customerName = order.customerName;
        newOrder.sourceFile = req.file.filename
        return await orderService.createOrder(newOrder)
      } catch (saveErr) {
        console.log("save order error", saveErr);
        return null;
      }
    }))

    const succcess = savedOrders.filter(order => order !== null)

    res.status(200).json({
      message: 'Upload orders success',
      data: succcess
    })


  } catch (err) {
    res.status(500).json({
      message: 'Upload orders failed ' + err.message
    })
  }
});

// api for orders
app.get('/latest-orders', async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const orders = await orderService.getTopLastestOrders(limit)
    res.status(200).json({
      message: 'Get orders success',
      data: orders
    })

  } catch (err) {
    res.status(500).json({
      message: 'Get orders failed ' + err.message
    })
  }
})

//find orders
app.get('/orders', async (req, res) => {
  try {
    const { q } = req.query;


    const { page = 1, limit = 10 } = req.query;
    if (q && q.length > 0) {
      const orders = await orderService.getOrderByPhoneNumberOrShipCode(q, page, limit)
      const totalOrders = await orderService.countOrderByPhoneNumberOrShipCode(q)
      return res.status(200).json({
        message: 'Get orders success',
        data: {
          orders,
          currentPage: page,
          totalPages: Math.ceil(totalOrders / limit),
        }
      })

    }

    const orders = await orderService.getOrderPagination(page, limit)
    const totalOrders = await orderService.countOrders()
    res.status(200).json({
      message: 'Get orders success',
      data: {
        orders,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
      }
    })

  } catch (err) {
    res.status(500).json({
      message: 'Get orders failed ' + err.message
    })
  }
})

// find order by phone number
app.get('/orders/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    if (!phoneNumber) {
      return res.status(400).json({
        message: 'Please fill all fields'
      })
    }
    const orders = await orderService.getOrderByPhoneNumber(phoneNumber)
    res.status(200).json({
      message: 'Get orders success',
      data: orders
    })

  } catch (err) {
    res.status(500).json({
      message: 'Get orders failed ' + err.message
    })
  }
})

app.get('/orders-count', async (req, res) => {
  try {
    const { q } = req.query;
    if (q && q.length > 0) {
      const totalOrders = await orderService.countOrderByPhoneNumberOrShipCode(q)
      return res.status(200).json({
        message: 'Count orders success',
        data: totalOrders
      })

    }
    const totalOrders = await orderService.countOrders()
    res.status(200).json({
      message: 'Count orders success',
      data: totalOrders
    })

  } catch (err) {
    res.status(500).json({
      message: 'Get orders failed ' + err.message
    })
  }
})

app.delete('/orders', async (req, res) => {
  const { sourceFile } = req.body;
  if (!sourceFile) {
    return res.status(400).json({
      message: 'Please fill all fields'
    })
  }
  try {
    const orders = await orderService.deleteOrdersBySourceFile(sourceFile)
    res.status(200).json({
      message: 'Delete orders success',
      data: orders
    })
  } catch (err) {
    res.status(500).json({
      message: 'Delete orders failed ' + err.message
    })

  }
})

//start server
const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`App listening on port ${port}`)

})