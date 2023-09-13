import {Repository} from "typeorm";
import {AppDataSource} from "../data-source";
import {Order, ShippingUnit} from "../entity";

class ShippingUnitService {
  private shippingUnitRepository: Repository<ShippingUnit>

  constructor() {
    this.shippingUnitRepository = AppDataSource.getRepository(ShippingUnit)
  }

  async createShippingUnit(shippingUnit: ShippingUnit): Promise<ShippingUnit> {
    const existShippingUnit = await this.shippingUnitRepository.findOne({
      where: {
        name: shippingUnit.name
      }
    })
    if (existShippingUnit) throw new Error('ShippingUnit already exist')
    return await this.shippingUnitRepository.save(shippingUnit)
  }

  async getAll(): Promise<ShippingUnit[]> {
    return await this.shippingUnitRepository.find()
  }

  async updateShippingUnit(shippingUnit: ShippingUnit): Promise<ShippingUnit> {
    return await this.shippingUnitRepository.save(shippingUnit)
  }

  async findById(id: number): Promise<ShippingUnit> {
    return await this.shippingUnitRepository.findOne({
      where: {
        id
      }
    })
  }
}

export default ShippingUnitService
