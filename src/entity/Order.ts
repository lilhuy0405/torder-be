import {Column, Entity, ManyToOne, OneToMany, PrimaryColumn} from "typeorm"
import ShippingUnit from "./ShippingUnit";

@Entity()
class Order {
  @Column({
    name: 'customer_name',
  })
  customerName: string

  @PrimaryColumn({
    name: 'phone_number',
  })
  phoneNumber: string

  @PrimaryColumn({
    name: 'ship_code',
  })
  shipCode: string

  @Column()
  product: string

  @Column({
    type: 'float',
    nullable: true,
  })
  amount: number

  @Column({
    nullable: true,
  })
  shipAddress: string

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date

  @Column({
    name: 'source_file',
    nullable: true,
  })
  sourceFile: string

  @Column({
    nullable: true,
  })

  shippingUnitId: number
  @ManyToOne(type => ShippingUnit, x => x.orders, {
    nullable: true,
  })
  shippingUnit: ShippingUnit

  //this will be update when summary order
  @Column({
    name: 'customer_id',
    nullable: true,
  })
  customerId: number

  @Column({
    name: 'product_id',
    nullable: true,
  })
  productId: number


}

export default Order
