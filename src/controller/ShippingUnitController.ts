import {ShippingUnitService} from "../service";
import {Request, Response} from "express";
import {ShippingUnit} from "../entity";

class ShippingUnitController {
  readonly shippingUnitService: ShippingUnitService;

  constructor() {
    this.shippingUnitService = new ShippingUnitService();
  }

  async createShippingUnit(req: Request, res: Response) {
    try {
      const {name, trackingWebsite, appName} = req.body;
      if (!name || !trackingWebsite) {
        return res.status(400).json({
          message: 'Please fill all fields'
        })
      }
      const shippingUnit = new ShippingUnit();
      shippingUnit.name = name;
      shippingUnit.trackingWebsite = trackingWebsite;
      if (appName) {
        shippingUnit.appName = appName;
      }
      const created = await this.shippingUnitService.createShippingUnit(shippingUnit);
      return res.status(201).json({
        message: 'created',
        data: created
      })
    } catch (err: any) {
      console.log("create shipping unit error", err);
      return res.status(500).json({
        message: err.message
      })
    }
  }

  async updateShippingUnit(req: Request, res: Response) {
    try {
      const {id} = req.params;
      const shippingUnit = await this.shippingUnitService.findById(+id);
      if (!shippingUnit) {
        return res.status(400).json({
          message: 'Shipping unit not found'
        })
      }
      const {name, trackingWebsite, appName} = req.body;
      if (name) {
        shippingUnit.name = name;
      }
      if (trackingWebsite) {
        shippingUnit.trackingWebsite = trackingWebsite;
      }
      if (appName) {
        shippingUnit.appName = appName;
      }
      const updated = await this.shippingUnitService.updateShippingUnit(shippingUnit);
      return res.status(200).json({
        message: 'updated',
        data: updated
      })
    } catch (err: any) {
      console.log("update shipping unit error", err);
      return res.status(500).json({
        message: err.message
      })

    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const shippingUnits = await this.shippingUnitService.getAll();
      return res.status(200).json({
        message: 'Get shipping units success',
        data: shippingUnits
      })

    } catch (err: any) {
      console.log("get shipping units error", err);
      return res.status(500).json({
        message: err.message
      })
    }
  }

  async deleteShippingUnit(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const shippingUnit = await this.shippingUnitService.deleteById(+id);
      return res.status(200).json({
        message: 'deleted',
        data: shippingUnit
      })
    } catch (err: any) {
      console.log("delete shipping unit error", err);
      return res.status(500).json({
        message: err.message
      })
    }
  }


}

export default ShippingUnitController;
