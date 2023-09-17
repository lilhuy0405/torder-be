import {CustomerService, OrderService} from "../service";
import {Request, Response} from "express";

class CustomerController {
  private readonly customerService: CustomerService;
  private readonly orderService: OrderService;

  constructor() {
    this.customerService = new CustomerService();
    this.orderService = new OrderService();
  }

  async findAll(req: Request, res: Response) {
    const params = req.query;
    try {
      const customerPaginated = await this.customerService.findAll(params);
      res.status(200).json({
        message: 'Get customers success',
        data: customerPaginated
      });
    } catch (err: any) {
      res.status(500).json({
        message: 'Get customers failed ' + err.message
      })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const {name, phone, address,} = req.body;
      const toUpdate = await this.customerService.findById(+id);
      if (!toUpdate) {
        return res.status(400).json({
          message: 'Customer not found'
        })
      }
      if (name) toUpdate.name = name;
      if (phone) toUpdate.phone = phone;
      if (address) toUpdate.address = address;
      const updated = await this.customerService.update(toUpdate);
      //update orders
      const customerOrders = await this.orderService.findByCustomerId(updated.id);
      if (customerOrders && customerOrders.length > 0) {
        for (const customerOrder of customerOrders) {
          if (name) customerOrder.customerName = name;
          if (phone) customerOrder.phoneNumber = phone;
          if (address) customerOrder.shipAddress = address;
          await this.orderService.updateOrder(customerOrder);
        }
      }
      res.status(200).json({
        message: 'Update customer success',
        data: updated
      });
    } catch (err: any) {
      console.log("update error: ", err);
    }
  }

  async getOrders(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const orders = await this.orderService.findByCustomerId(+userId);
      res.status(200).json({
        message: 'Get orders success',
        data: orders
      });

    } catch (err: any) {
      console.log("getOrders error: ", err);
      return res.status(500).json({
        message: 'Get orders failed ' + err.message
      })
    }
  }
}

export default CustomerController;
