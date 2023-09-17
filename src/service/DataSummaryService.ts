import {CustomerService, OrderService, ProductService} from "./index";
import {Customer, Product} from "../entity";

class DataSummaryService {
  private readonly _orderService: OrderService
  private readonly _customerService: CustomerService
  private readonly _productService: ProductService

  constructor() {
    this._orderService = new OrderService()
    this._customerService = new CustomerService()
    this._productService = new ProductService()
  }

  async summary(): Promise<void> {
    const orderNotSummary = await this._orderService.findNotSummaryOrder();
    console.log('Found', orderNotSummary.length, 'order need to summary')
    if (!orderNotSummary || !orderNotSummary.length) {
      console.log('No order need to summary')
      return
    }
    for (const order of orderNotSummary) {
      try {
        const customer = await this._customerService.findByPhone(order.phoneNumber)
        if (!customer) {
          //save customer
          const newCustomer = new Customer()
          newCustomer.name = order.customerName
          newCustomer.phone = order.phoneNumber
          newCustomer.address = order.shipAddress
          const created = await this._customerService.create(newCustomer)
          console.log('Created new customer', created.phone)
          order.customerId = created.id
          await this._orderService.updateOrder(order)
          console.log('Updated order', order.shipCode)
        } else {
          console.log('Found customer', customer.phone)
          order.customerId = customer.id
          await this._orderService.updateOrder(order)
          console.log('Updated order', order.shipCode)
        }

        const product = await this._productService.findByName(order.product)
        if (!product) {
          const newProduct = new Product()
          newProduct.name = order.product
          const created = await this._productService.create(newProduct)
          console.log('Created new product', created.name)
          order.productId = created.id
          await this._orderService.updateOrder(order)
        } else {
          console.log('Found product', product.name)
          order.productId = product.id
          await this._orderService.updateOrder(order)
        }
      } catch (err: any) {
        console.log('Error', err.message)
      }
    }

    console.log('Summary done')
  }
}

export default DataSummaryService
