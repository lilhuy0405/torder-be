import {OrderService, ProductService} from "../service";
import {Request, Response} from "express";

class ProductController {
  private readonly _productService: ProductService;
  private readonly _orderService: OrderService;

  constructor() {
    this._productService = new ProductService();
    this._orderService = new OrderService();
  }

  async findAll(req: Request, res: Response) {
    try {
      const params = req.query;
      const products = await this._productService.findAll(params);
      return res.status(200).json({
        message: 'Get products success',
        data: products
      });
    } catch (err: any) {
      console.log("getProducts error: ", err);
      return res.status(500).json({
        message: 'Get products failed ' + err.message
      })
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const {name, price, description} = req.body;
      const toUpdate = await this._productService.findById(+id);
      if (!toUpdate) {
        return res.status(400).json({
          message: 'Product not found'
        })
      }
      if (name) toUpdate.name = name;
      if (price) toUpdate.price = price;
      if (description) toUpdate.description = description;
      const updated = await this._productService.update(toUpdate);
      //update orders
      const productOrders = await this._orderService.findByProductId(updated.id);
      if (productOrders && productOrders.length > 0) {
        for (const productOrder of productOrders) {
          if (name) productOrder.product = name;
          await this._orderService.updateOrder(productOrder);
        }
      }
      return res.status(200).json({
        message: 'Update product success',
        data: updated
      });

    } catch (err: any) {
      console.log("update error: ", err);
      return res.status(500).json({
        message: 'Update product failed ' + err.message
      })
    }
  }
}

export default ProductController;