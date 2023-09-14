import {Like, Repository} from "typeorm";
import {Order} from "../entity";
import {AppDataSource} from '../data-source';
import {Pagination} from "../type";

class OrderService {
  private orderRepository: Repository<Order>

  constructor() {
    this.orderRepository = AppDataSource.getRepository(Order)
  }

  async createOrder(order: Order): Promise<Order> {
    const existOrder = await this.orderRepository.findOne({
      where: {
        phoneNumber: order.phoneNumber,
        shipCode: order.shipCode
      }
    })
    if (existOrder) throw new Error('Order already exist')
    return await this.orderRepository.save(order)
  }

  async getTopLastestOrders(limit: Number): Promise<Order[]> {
    const options: any = {
      order: {
        createdAt: 'DESC'
      },
      relations: ['shippingUnit'],

    }
    if (limit) {
      options['take'] = limit
    }
    return await this.orderRepository.find(options);
  }

  async getOrderPagination(params: any): Promise<Pagination<Order>> {
    const {
      page = 0,
      limit = 10,
      phoneNumber,
      shipCode,
      shippingUnitId,
      sortDirection,
      sortBy,
    } = params
    const baseQueryOptions: any = {
      where: {},
      skip: page * limit,
      take: limit,
      relations: ['shippingUnit']
    }
    if (shippingUnitId) {
      baseQueryOptions.where = {
        ...baseQueryOptions.where,
        shippingUnitId
      }
    }
    //find by phone number or ship code

    if (phoneNumber) {
      baseQueryOptions.where = {
        ...baseQueryOptions.where,
        phoneNumber: Like(`%${phoneNumber}%`)
      }
    }
    if (shipCode) {
      baseQueryOptions.where = {
        ...baseQueryOptions.where,
        shipCode: Like(`%${shipCode}%`)
      }
    }
    if (sortDirection && sortBy) {
      baseQueryOptions.order = {
        [sortBy]: sortDirection
      }
    }
    const list = await this.orderRepository.findAndCount(baseQueryOptions);
    const totalPage = Math.ceil(list[1] / limit)
    return {
      contents: list[0],
      currentPage: page,
      perPage: limit,
      totalPage: totalPage,
      totalElements: list[1]
    }
  }

  async getOrderByPhoneNumber(phoneNumber: string): Promise<Order[]> {
    return await this.orderRepository.find({
      where: {
        phoneNumber
      },
      order: {
        createdAt: 'DESC'
      },
      relations: ['shippingUnit']
    })
  }

  async getOrderByShipCode(shipCode: string): Promise<Order> {
    return await this.orderRepository.findOne({
      where: {
        shipCode
      },
      relations: ['shippingUnit']
    })
  }

  async getOrderByPhoneNumberOrShipCode(q, page, limit): Promise<Order[]> {
    return await this.orderRepository.find({
      where: [
        {
          phoneNumber: Like(`%${q}%`)
        },
        {
          shipCode: Like(`%${q}%`)
        },
        {
          customerName: Like(`%${q}%`)
        },
        {
          product: Like(`%${q}%`)
        }
      ],
      order: {
        createdAt: 'DESC'
      },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['shippingUnit']
    })
  }

  async countOrderByPhoneNumberOrShipCode(q): Promise<number> {
    return await this.orderRepository.count({
      where: [
        {
          phoneNumber: Like(`%${q}%`)
        },
        {
          shipCode: Like(`%${q}%`)
        },
        {
          customerName: Like(`%${q}%`)
        },
        {
          product: Like(`%${q}%`)
        }
      ],
      relations: ['shippingUnit']

    })
  }

  async countOrders(): Promise<number> {
    return await this.orderRepository.count()
  }

  async deleteOrdersBySourceFile(sourceFile: string): Promise<void> {
    await this.orderRepository.delete({
      sourceFile
    })
  }

  async deleteOrder(shipcode: string, phoneNumber: string): Promise<void> {
    await this.orderRepository.delete({
      shipCode: shipcode,
      phoneNumber
    })
  }

  async deleteOrderById(phoneNumber: string, shipCode: string): Promise<void> {
    await this.orderRepository.delete({
      phoneNumber,
      shipCode
    })
  }



  async updateData() {
    await this.orderRepository.createQueryBuilder('order').update(Order).set({
      shippingUnitId: 2
    }).where("createdAt >= '2023-09-13'").execute()

    await this.orderRepository.createQueryBuilder('order').update(Order).set({
      shippingUnitId: 1
    }).where("createdAt < '2023-09-13'").execute()
  }

}

export default OrderService
