"use strict";

const { Contract } = require("fabric-contract-api");
const contractNameSpace = "org.pharma-network.pharmanet";

class PharmaNetContract extends Contract {

  constructor() {
    super(contractNameSpace);
  }

  listMSPIDS() {
    return ["manufacturerMSP", "distributorMSP", "retailerMSP", "transporterMSP"];
  }

  listORG() {
    return ["Manufacturer", "Distributor", "Retailer", "Transporter"];
  }

  
  /**
   * 
   * @param {*} object 
   */
  toBuffer(object) {
    try {
      return Buffer.from(JSON.stringify(object));
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * 
   * @param {*} ctx 
   */
  async instantiate(ctx) {
    let msg = "Smart Contract Instantiated.";
    console.log(msg);
    return msg;
  }

  /**
   * 
   * @param {*} ctx 
   * @param  {...any} keys 
   */
  async getState(ctx, ...keys) {
    try {
      const compositeKey = await ctx.stub.createCompositeKey(contractNameSpace, keys);
      let asset = (await ctx.stub.getState(compositeKey)).toString();
      if (asset) asset = JSON.parse(asset);
      return { assetId: keys.join(":"), compositeKey, asset };
    } catch (error) {
      throw new Error(error.message || error);
    }
  }

  /**
   * 
   * @param {*} ctx 
   * @param {*} Partial 
   * @param {*} namespace 
   */
  async getStateByPartialCompositeKey(ctx, ...Partial) {
    try {
      let iterator = await ctx.stub.getStateByPartialCompositeKey(contractNameSpace, Partial);
      let result = await iterator.next();

      while (true) {
        if (result.value && result.value.value)
          return JSON.parse(result.value.value.toString('utf8'));

        if (result.done) {
         await iterator.close();
          break;
        }

        result = await iterator.next();
      }

    } catch (error) {
      throw new Error(error.message || error);
    }

  }

  /**
   * 
   * @param {*} ctx 
   * @param {*} companyName 
   * @param {*} companyCRN 
   * @param {*} location 
   * @param {*} organisationRole 
   */
  async registerCompany(ctx, companyName, companyCRN, location, organisationRole) {
    try {
      if (!this.listORG().includes(organisationRole))
        throw new Error('Failed to process the request where organisationRole is invalid.');

      if (!this.listMSPIDS().includes(ctx.clientIdentity.getMSPID()))
        throw new Error("transaction aborted");

      let hierarchyKey;

      switch (organisationRole) {
        case "Manufacturer":
          hierarchyKey = 1;
          break;
        case "Distributor":
          hierarchyKey = 2;
          break;
        case "Retailer":
          hierarchyKey = 3;
          break;
        default:
          break;
      }

      let { assetId, compositeKey, asset } = await this.getState(ctx, companyCRN, companyName);

      if (asset)
        throw new Error(`Failed to process the request where this company is already registered in the system.`);

      let newOrgObject = {
        companyID: assetId,
        name: companyName,
        location,
        organisationRole,
        hierarchyKey,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await ctx.stub.putState(compositeKey, this.toBuffer(newOrgObject));
      return newOrgObject;
    } catch (error) {
      throw new Error(error.message || error);
    }
  }

  /**
   * 
   * @param {*} ctx 
   * @param {*} drugName 
   * @param {*} serialNo 
   * @param {*} mfgDate 
   * @param {*} expDate 
   * @param {*} companyCRN 
   */
  async addDrug(ctx, drugName, serialNo, mfgDate, expDate, companyCRN) {
    try {
      // if (ctx.clientIdentity.getMSPID() !== "manufacturerMSP")
      //   throw new Error('Failed to process the request where organisationRole is invalid.');

      const company = await this.getStateByPartialCompositeKey(ctx, companyCRN);

      if (!company)
        throw new Error(`Failed to process the request where company is not exist with companyCRN: ${companyCRN}.`);

      const { assetId, compositeKey, asset } = await this.getState(ctx, drugName, serialNo);

      if (asset)
        throw new Error(`Failed to process the request where can't add drug with ID:${assetId} and serialNo: ${serialNo}.`);

      const newDrugObject = {
        productID: assetId,
        name: drugName,
        manufacturer: company.companyID,
        manufacturingDate: mfgDate,
        expiryDate: expDate,
        owner: company.companyID,
        shipment: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await ctx.stub.putState(compositeKey, this.toBuffer(newDrugObject));
      return newDrugObject;
    } catch (error) {
      throw new Error(error.message || error);
    }
  }

  /**
   * 
   * @param {*} ctx 
   * @param {*} buyerCRN 
   * @param {*} sellerCRN 
   * @param {*} drugName 
   * @param {*} quantity 
   */
  async createPO(ctx, buyerCRN, sellerCRN, drugName, quantity) {
    try {
      // if (["distributorMSP", "retailerMSP"].includes(ctx.clientIdentity.getMSPID()))
      //   throw new Error('Failed to process the request where organisation is invalid.');

      const buyer = await this.getStateByPartialCompositeKey(ctx, buyerCRN);

      if (!buyer)
        throw new Error(`Failed to process the request where buyer is not exist with buyerCRN: ${buyerCRN}.`);

      const seller = await this.getStateByPartialCompositeKey(ctx, sellerCRN);

      if (!seller)
        throw new Error(`Failed to process the request where buyer is not exist with buyerCRN: ${sellerCRN}.`);

      if (buyer.hierarchyKey < seller.hierarchyKey)
        throw new Error('Failed to process the request where selling drug to the buyer is not valid.');

      const { assetId, compositeKey, asset } = await this.getState(ctx, "PO", buyerCRN, drugName);

      if (asset)
        throw new Error("Failed to process request where PO can't be duplicate.");

      const newpoObject = {
        poID: assetId,
        drugName,
        quantity,
        buyer: buyer.companyID,
        seller: seller.companyID,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await ctx.stub.putState(compositeKey, this.toBuffer(newpoObject));
      return newpoObject;
    } catch (error) {
      throw new Error(error.message || error);
    }
  }

  /**
   * 
   * @param {*} ctx 
   * @param {*} buyerCRN 
   * @param {*} drugName 
   * @param {*} listOfAssets 
   * @param {*} transporterCRN 
   */
  async createShipment(ctx, buyerCRN, drugName, listOfAssets, transporterCRN) {
    try {
      // if (!["distributorMSP", "manufacturerMSP"].includes(ctx.clientIdentity.getMSPID()))
      //   throw new Error('Failed to process the request where organisation is invalid.');

      // if (buyerData.hierarchyKey < seller.hierarchyKey)
      // throw new Error('Failed to process the request where selling drug to the buyer is not valid.');

      const transporter = await this.getStateByPartialCompositeKey(ctx, transporterCRN);

      if (!transporter)
        throw new Error('Failed to process request where transporter is not valid/exist.');

      const poData = await this.getStateByPartialCompositeKey(ctx, "PO", buyerCRN, drugName);

      if (!poData)
        throw new Error('Failed to process request where PO is not valid/exist.');

      const { assetId, compositeKey, asset } = await this.getState(ctx, "shipment", buyerCRN, drugName);

      if (asset)
        throw new Error('Failed to process request where the shipment is alredy created.');

      const drug = await this.getStateByPartialCompositeKey(ctx, drugName);

      if (!drug)
        throw new Error('Failed to process request where drug is not valid/exist.');

      const creator = drug.owner;

      const assets = listOfAssets.split(",");

      for (const drugID of assets) {
        const { compositeKey, asset } = await this.getState(ctx, ...drugID.split(":"));

        if (!asset)
          throw new Error(`Failed to process request where drug with ID:${compositeKey} is not valid/exist.`);

        if (creator != asset.owner)
          throw new Error(`Failed to process request where drug owner ${creator} mismatched with ${asset.owner}.`);

        asset.shipment.push(assetId);
        asset.owner = transporter.companyID;
        asset.updatedAt = new Date();
        await ctx.stub.putState(compositeKey, this.toBuffer(asset));
      }

      const newShipmentObject = {
        shipmentID: assetId,
        creator,
        assets,
        transporter: transporter.companyID,
        status: "in-transit",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await ctx.stub.putState(compositeKey, this.toBuffer(newShipmentObject));
      return newShipmentObject;
    } catch (error) {
      throw new Error(error.message || error);
    }
  }

  /**
   * 
   * @param {*} ctx 
   * @param {*} buyerCRN 
   * @param {*} drugName 
   * @param {*} transporterCRN 
   */
  async updateShipment(ctx, buyerCRN, drugName, transporterCRN) {
    try {
      // if (ctx.clientIdentity.getMSPID() !== "transporterMSP")
      //   throw new Error('Failed to process request where the request made is not a transporter.');

      const transporter = await this.getStateByPartialCompositeKey(ctx, transporterCRN);

      if (!transporter)
        throw new Error('Failed to process request where transporter is not valid/exist.');

      const buyer = await this.getStateByPartialCompositeKey(ctx, buyerCRN);

      if (!buyer)
        throw new Error('Failed to process request where buyer is not valid/exist.');

      const { compositeKey, asset } = await this.getState(ctx, "shipment", buyerCRN, drugName);

      if (!asset)
        throw new Error('Failed to process request where shipment is not valid/exist.');

      const shipment = asset;

      if (!shipment.assets || !shipment.assets.length)
        throw new Error('Failed to process request where drugs are missing in the shipment.');

      for (const drugID of shipment.assets) {
        const { compositeKey, asset } = await this.getState(ctx, ...drugID.split(":"));

        if (!asset)
          throw new Error('Failed to process request where shipment asset is missing.');

        asset.owner = buyer.companyID;
        asset.updatedAt = new Date();
        await ctx.stub.putState(compositeKey, this.toBuffer(asset));
      }

      shipment.status = "delivered";
      shipment.updatedAt = new Date();

      await ctx.stub.putState(compositeKey, this.toBuffer(shipment));
      return shipment;
    } catch (error) {
      throw new Error(error.message || error);
    }
  }

  /**
   * 
   * @param {*} ctx 
   * @param {*} drugName 
   * @param {*} serialNo 
   * @param {*} retailerCRN 
   * @param {*} customerAadhar 
   */
  async retailDrug(ctx, drugName, serialNo, retailerCRN, customerAadhar) {
    try {
      // if (ctx.clientIdentity.getMSPID() !== "retailerMSP")
      //   throw new Error('Failed to process request where retailer is not valid/exist.');

      const retailer = await this.getStateByPartialCompositeKey(ctx, retailerCRN);

      if (!retailer)
        throw new Error('Failed to process request where retailer is not valid/exist.');

      const { compositeKey, asset } = await this.getState(ctx, drugName, serialNo);

      if (!asset)
        throw new Error('Failed to process request where drug is not valid/exist.');

      if (asset.owner != retailer.companyID)
        throw new Error('Failed to process request where retaile is not the drug owner.');

      asset.owner = customerAadhar;
      asset.updatedAt = new Date();

      await ctx.stub.putState(compositeKey, this.toBuffer(asset));
      return asset;
    } catch (error) {
      throw new Error(error.message || error);
    }
  }

  /**
   * 
   * @param {*} ctx 
   * @param {*} drugName 
   * @param {*} serialNo 
   */
  async viewHistory(ctx, drugName, serialNo) {
    try {
      const compositeKey = await ctx.stub.createCompositeKey(contractNameSpace, [drugName, serialNo]);

      let iterator = await ctx.stub.getHistoryForKey(compositeKey);
      let res = await iterator.next();
      let result = [];

      while (true) {
        if (res.value && res.value.value)
          result.push(JSON.parse(res.value.value.toString('utf8')));

        if (res.done) {
          await iterator.close();
           break;
         }

        res = await iterator.next();
      }

      if (!result)
        throw new Error('Failed to process request where drug is not valid/exist.');

      return result;
    } catch (error) {
      throw new Error(error.message || error);
    }
  }

  /**
   * 
   * @param {*} ctx 
   * @param {*} drugName 
   * @param {*} serialNo 
   */
  async viewDrugCurrentState(ctx, drugName, serialNo) {
    try {
      const { asset } = await this.getState(ctx, drugName, serialNo)
      if (!asset)
        throw new Error('Failed to process request where drug is not valid/exist.');
      return asset;
    } catch (error) {
      throw new Error(error.message || error);
    }
  }

}

module.exports = PharmaNetContract;
