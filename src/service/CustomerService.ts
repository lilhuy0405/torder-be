import {Like, Repository} from "typeorm";
import {Customer} from "../entity";
import {AppDataSource} from "../data-source";
import {Pagination} from "../type";

class CustomerService {

  private readonly _customerRepository: Repository<Customer>

  constructor() {
    this._customerRepository = AppDataSource.getRepository(Customer);
  }

  async create(customer: Customer): Promise<Customer> {
    return await this._customerRepository.save(customer);
  }

  async update(customer: Customer): Promise<Customer> {
    return await this._customerRepository.save(customer);
  }

  async findAll(params: any = {}): Promise<Pagination<Customer>> {
    const {page = 0, limit = 10, phone, name} = params;
    const baseQuery = {
      take: limit,
      skip: page * limit,
      where: {},
    }
    if (phone) {
      baseQuery.where = {
        ...baseQuery.where,
        phone: Like(`%${phone}%`),
      }
    }
    if (name) {
      baseQuery.where = {
        ...baseQuery.where,
        name: Like(`%${name}%`),
      }
    }
    const [data, total] = await this._customerRepository.findAndCount(baseQuery);
    return {
      contents: data,
      currentPage: page,
      perPage: limit,
      totalElements: total,
      totalPage: Math.ceil(total / limit),
    }
  }

  async delete(id: number): Promise<void> {
    await this._customerRepository.delete(id);
  }

  async findByPhone(phone: string): Promise<Customer> {
    return await this._customerRepository.findOne({
      where: {
        phone
      }
    })
  }

  findById(id: number): Promise<Customer> {
    return this._customerRepository.findOne({
      where: {
        id
      }
    });
  }

}

export default CustomerService
