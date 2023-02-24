import { Repository } from "typeorm";
import { Order } from "../entity";
import { AppDataSource } from '../data-source';

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

        }
        if (limit) {
            options['take'] = limit
        }
        return await this.orderRepository.find(options);
    }

    async getOrderPagination(page = 1, limit = 10): Promise<Order[]> {
        return await this.orderRepository.find({
            order: {
                createdAt: 'DESC'
            },
            skip: (page - 1) * limit,
            take: limit
        })
    }

    async getOrderByPhoneNumber(phoneNumber: string): Promise<Order[]> {
        return await this.orderRepository.find({
            where: {
                phoneNumber
            },
            order: {
                createdAt: 'DESC'
            }
        })
    }

    async getOrderByShipCode(shipCode: string): Promise<Order> {
        return await this.orderRepository.findOne({
            where: {
                shipCode
            }
        })
    }

    async getOrderByPhoneNumberOrShipCode(q): Promise<Order[]> {
        return await this.orderRepository.find({
            where: [
                {
                    phoneNumber: q
                },
                {
                    shipCode: q
                },
                {
                    customerName: q
                },
                {
                    product: q
                }
            ],
            order: {
                createdAt: 'DESC'
            }
        })
    }

    async countOrders(): Promise<number> {
        return await this.orderRepository.count()
    }

}

export default OrderService