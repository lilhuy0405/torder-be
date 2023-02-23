import { Repository } from "typeorm";
import { Order } from "../entity";
import { AppDataSource } from '../data-source';

class OrderService {
    private orderRepository: Repository<Order>

    constructor() {
        this.orderRepository = AppDataSource.getRepository(Order)
    }

    async createOrder(order: Order): Promise<Order> {
        return await this.orderRepository.save(order)
    }

    async getOrders(): Promise<Order[]> {
        return await this.orderRepository.find({
            order: {
                createdAt: 'DESC'
            }
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

}

export default OrderService