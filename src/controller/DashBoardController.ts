import {CustomerService, OrderService, ProductService} from "../service";
import {Request, Response} from "express";

class DashBoardController {
  private readonly _productService: ProductService;
  private readonly _orderService: OrderService;
  private readonly _customerService: CustomerService;

  constructor() {
    this._productService = new ProductService();
    this._orderService = new OrderService();
    this._customerService = new CustomerService();
  }

  async count(req: Request, res: Response) {
    try {
      const totalOrders = await this._orderService.countOrders();
      const totalProducts = await this._productService.count();
      const totalCustomers = await this._customerService.count();
      const totalRevenue = await this._orderService.sumAmount();

      return res.status(200).json({
        message: 'Get dashboard success',
        data: {
          totalOrders,
          totalProducts,
          totalCustomers,
          totalRevenue
        }
      });

    } catch (err: any) {
      console.log("getDashboard error: ", err);
      return res.status(500).json({
        message: 'Get dashboard failed ' + err.message
      })
    }
  }
}

export default DashBoardController
