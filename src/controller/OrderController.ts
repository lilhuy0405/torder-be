import {OrderService, ShippingUnitService} from "../service";
import {Request, Response} from "express";
import uploadFileMiddleware from "../middleware/upload";
import Order from "../entity/Order";
import {AuthenticatedRequest} from "../type";
import Excel = require('exceljs');

class OrderController {
  private readonly orderService: OrderService;
  private readonly shippingUnitService: ShippingUnitService;

  constructor() {
    this.orderService = new OrderService();
    this.shippingUnitService = new ShippingUnitService();
  }

  async uploadOrders(req: AuthenticatedRequest, res: Response) {
    try {
      await uploadFileMiddleware(req, res)
      const {shipCodeColumn, phoneColumn, productColumn, customerNameColumn, dataStartRow, shippingUnitId} = req.body;
      if (!shipCodeColumn || !phoneColumn || !productColumn || !customerNameColumn || !dataStartRow) {
        return res.status(400).json({
          message: 'Please fill all fields'
        })
      }

      console.log(req.file);
      console.log({shipCodeColumn, phoneColumn, productColumn, customerNameColumn, dataStartRow});

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
      worksheet.eachRow({includeEmpty: true}, function (row, rowNumber) {
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
          if (shippingUnitId) {
            const shippingUnit = await this.shippingUnitService.findById(shippingUnitId);
            if (shippingUnit) {
              newOrder.shippingUnit = shippingUnit;
            }
          }
          return await this.orderService.createOrder(newOrder)
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
  }

  async getOrders(req: Request, res: Response) {
    try {
      const params = req.query;
      const result = await this.orderService.getOrderPagination(params)
      res.status(200).json({
        message: 'Get orders success',
        data: result
      })
    } catch (err: any) {
      console.log("getOrders error: ", err);
      return res.status(500).json({
        message: 'Get orders failed ' + err.message
      })
    }

  }

  async getOrderByPhoneNumber(req: Request, res: Response) {
    try {
      const {phoneNumber} = req.params;
      if (!phoneNumber) {
        return res.status(400).json({
          message: 'Please fill all fields'
        })
      }
      const orders = await this.orderService.getOrderByPhoneNumber(phoneNumber)
      res.status(200).json({
        message: 'Get orders success',
        data: orders
      })

    } catch (err) {
      res.status(500).json({
        message: 'Get orders failed ' + err.message
      })
    }
  }

  async countOrders(req: Request, res: Response) {
    try {
      const {q} = req.query;
      if (q && q.length > 0) {
        const totalOrders = await this.orderService.countOrderByPhoneNumberOrShipCode(q)
        return res.status(200).json({
          message: 'Count orders success',
          data: totalOrders
        })

      }
      const totalOrders = await this.orderService.countOrders()
      res.status(200).json({
        message: 'Count orders success',
        data: totalOrders
      })

    } catch (err) {
      res.status(500).json({
        message: 'Get orders failed ' + err.message
      })
    }
  }

  async deleteBySource(req: Request, res: Response) {
    const {sourceFile} = req.body;
    if (!sourceFile) {
      return res.status(400).json({
        message: 'Please fill all fields'
      })
    }
    try {
      const orders = await this.orderService.deleteOrdersBySourceFile(sourceFile)
      res.status(200).json({
        message: 'Delete orders success',
        data: orders
      })
    } catch (err) {
      res.status(500).json({
        message: 'Delete orders failed ' + err.message
      })

    }
  }

  async deleteOrder(req: Request, res: Response) {
    try {
      const {phoneNumber, shipCode} = req.params;
      if (!phoneNumber || !shipCode) {
        return res.status(400).json({
          message: 'Please fill all fields'
        })
      }
      await this.orderService.deleteOrderById(phoneNumber, shipCode)
    } catch (err: any) {
      console.log("deleteOrder error: ", err);
      return res.status(500).json({
        message: 'Delete order failed ' + err.message
      })
    }
  }
}

export default OrderController;
