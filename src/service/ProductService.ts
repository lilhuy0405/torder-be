import {Product} from "../entity";
import {Like, Repository} from "typeorm";
import {AppDataSource} from "../data-source";
import {Pagination} from "../type";

class ProductService {
  private readonly _productRepository: Repository<Product>

  constructor() {
    this._productRepository = AppDataSource.getRepository(Product);
  }

  async create(product: Product): Promise<Product> {
    return await this._productRepository.save(product);
  }

  async update(product: Product): Promise<Product> {
    return await this._productRepository.save(product);
  }

  async findAll(params: any = {}): Promise<Pagination<Product>> {
    const {page = 0, limit = 10, name} = params;
    const baseQuery = {
      take: +limit,
      skip: +page * +limit,
      where: {},
    }
    if (name) {
      baseQuery.where = {
        ...baseQuery.where,
        name: Like(`%${name}%`),
      }
    }
    const [data, total] = await this._productRepository.findAndCount(baseQuery);
    return {
      contents: data,
      currentPage: page,
      perPage: limit,
      totalElements: total,
      totalPage: Math.ceil(total / limit),
    }
  }

  async findByName(name: string): Promise<Product> {
    return await this._productRepository.findOne({
      where: {
        name
      }
    })
  }

  async findById(id: number): Promise<Product> {
    return await this._productRepository.findOne({
      where: {
        id
      }
    })
  }

  async count(): Promise<number> {
    return await this._productRepository.count();
  }

}

export default ProductService
