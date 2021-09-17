"use strict";

const { Contract } = require("fabric-contract-api");

class ChainCode extends Contract {

  constructor() {
    super("org.pharma-network.pharmanet");
  }

  /**
   * 
   * @param {*} ctx 
   */
  async instantiate(ctx) {
    console.log("Smart Contract Instantiated.");
  }

  /**
   * 
   * @param {*} ctx 
   * @param {*} keys 
   */
  async createCompositeKey(ctx, keys) {
    try {
      return ctx.stub.createCompositeKey("org.pharma-network.pharmanet", keys);
    } catch (error) {
      console.log('Cought error.');
      throw new Error(error);
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

      if (!["Manufacturer", "Distributor", "Retailer", "Transporter"].includes(organisationRole))
        throw new Error('Failed to create request for this company as this company`s request already exists');
      let hierarchyKey;
      switch (hierarchyKey) {
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
      const companyID = this.createCompositeKey(ctx, [companyCRN, companyName]);

      const existingOrg = await ctx.stub.getState(orgKey);
      // .catch(() => console.log('Creating new org as old record isnt present'));

      if (existingOrg)
        throw new Error('Failed to create request for this company as this company`s request already exists');


      // if (ctx.clientIdentity.getMSPID() !== "registrarMSP") console.log("transaction aborted");

      let newOrgObject = {
        companyID,
        name: companyName,
        location,
        organisationRole,
        hierarchyKey,
        companyCRN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Convert the JSON object to a buffer and send it to blockchain for storage
      let dataBuffer = Buffer.from(JSON.stringify(newOrgObject));
      await ctx.stub.putState(orgKey, dataBuffer);
      // Return value of new Org account created
      return newOrgObject;
    } catch (error) {
      console.log('Cought error.');
      throw new Error(error);
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
      if (ctx.clientIdentity.getMSPID() !== "manufacturerMSP") console.log("transaction aborted");

      const productID = this.createCompositeKey(ctx, [drugName, serialNo]);

      let newDrugObject = {
        productID,
        name: drugName,
        manufacturer: ctx.clientIdentity.getID,
        manufacturingDate: mfgDate,
        expiryDate: expDate,
        owner: ctx.clientIdentity.getID,
        shipment: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Convert the JSON object to a buffer and send it to blockchain for storage
      let dataBuffer = Buffer.from(JSON.stringify(newDrugObject));
      await ctx.stub.putState(productID, dataBuffer);
      // Return value of new user account created
      return newDrugObject;
    } catch (error) {
      console.log('Cought error.');
      throw new Error(error);
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
      // if (ctx.clientIdentity.getMSPID() == "manufacturerMSP") console.log("transaction aborted");

      // Create the composite key required to fetch record from blockchain
      const poID = this.createCompositeKey(ctx, [buyerCRN, drugName]);
      const existingPo = await ctx.stub.getState(poID)
        .catch(() => console.log('Creating new Po as old record isnt present'));

      if (existingPo)
        throw new Error('Failed to create request for this po as this po`s request already exist');

      let newpoObject = {
        poID,
        drugName,
        quantity,
        buyer: ctx.clientIdentity.getID(),
        seller: sellerCRN, // need to replace with the seller composit key
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Convert the JSON object to a buffer and send it to blockchain for storage
      let dataBuffer = Buffer.from(JSON.stringify(newpoObject));
      await ctx.stub.putState(poKey, dataBuffer);
      // Return value of new user account created
      return newpoObject;
    } catch (error) {
      console.log('Cought error.');
      throw new Error(error);
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
      // Create the composite key required to fetch record from blockchain
      const shipmentID = this.createCompositeKey(ctx, [buyerCRN, drugName]);

      // Get Purchase Order Request object from blockchain 
      // let reqObj = await ctx.stub.getState(requestKey).catch((err) => console.log(err));

      let newShipmentObject = {
        shipmentID,
        creator: ctx.clientIdentity.getID(),
        assets: [],
        transporter: "", // composit key of transporter
        status: "in-transit",
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: "" // composit key of transporter
      };

      const shipmentKey = ctx.stub.createCompositeKey("org.property-registration-network.userRegnet.user", [name, aadhar]);

      // Convert the JSON object to a buffer and send it to blockchain for storage
      let dataBuffer = Buffer.from(JSON.stringify(newShipmentObject));
      await ctx.stub.putState(shipmentKey, dataBuffer);
      // Return value of new user account created
      return newShipmentObject;
    } catch (error) {
      console.log('Cought error.');
      throw new Error(error);
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
      if (ctx.clientIdentity.getMSPID() !== "transporterMSP") console.log("transaction aborted");
      // Create the composite key required to fetch record from blockchain
      const shipmentID = this.createCompositeKey(ctx, [buyerCRN, drugName]);

      // Return request object from blockchain
      let shipmentObject = await ctx.stub.getState(shipmentID).catch((err) => console.log(err));
      for (const drugID in shipmentObject.assets) {
        let dregObject = await ctx.stub.getState(drugID).catch((err) => console.log(err));
        dreg.shipment.push(shipmentID);
        let dataBuffer = Buffer.from(JSON.stringify(dregObject));
        await ctx.stub.putState(drugID, dataBuffer);
      };

      shipmentObject.status = "delivered";
      shipmentObject.owner = shipmentID;

      // Convert the JSON object to a buffer and send it to blockchain for storage
      let dataBuffer = Buffer.from(JSON.stringify(shipmentObject));
      await ctx.stub.putState(shipmentID, dataBuffer);
      // Return value of new user account created
      return shipmentObject;
    } catch (error) {
      console.log('Cought error.');
      throw new Error(error);
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
      if (ctx.clientIdentity.getMSPID() !== "retailerMSP") console.log("transaction aborted");
      const drugID = this.createCompositeKey(ctx, [drugName, serialNo]);
      let dregObject = await ctx.stub.getState(drugID).catch((err) => console.log(err));
      dregObject.owner = customerAadhar;
    } catch (error) {
      console.log('Cought error.');
      throw new Error(error);
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
      const drugID = this.createCompositeKey(ctx, [drugName, serialNo]);

      let dregObject = await ctx.stub.getState(drugID).catch((err) => console.log(err));

      return dregObject;
    } catch (error) {
      console.log('Cought error.');
      throw new Error(error);
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
      const drugID = this.createCompositeKey(ctx, [drugName, serialNo]);
      let dregObject = await ctx.stub.getState(drugID).catch((err) => console.log(err));
      return dregObject;

    } catch (error) {
      console.log('Cought error.');
      throw new Error(error);
    }
  }

  
  /**
   * 
   * @param {*} ctx 
   * @param {*} companyCRN 
   * @param {*} drugName 
   */
  // async getOrg(ctx, companyCRN, drugName) {
  //   try {
  //     const orgKey = this.createCompositeKey(ctx, [companyCRN, drugName]);
  //     const existingOrg = await ctx.stub.getState(orgKey)
  //       .catch(err => { throw new Error('Failed to fetch company. Company doesnt exist', err) });
  //     return existingOrg;
  //   } catch (error) {
  //     console.log('Cought error.');
  //     throw new Error(error);
  //   }
  // }

  
  /**
   * 
   * @param {*} ctx 
   * @param {*} drugName 
   * @param {*} serialNo 
   */
  // async viewDrugState(ctx, drugName, serialNo) {
  //   try {
  //     const drugKey = this.createCompositeKey(ctx, [drugName, serialNo]);
  //     const existingDrug = await ctx.stub.getState(drugKey)
  //       .catch(err => { throw new Error('Faild to fetch. Drug doesnt exist') });
  //     return existingDrug;
  //   } catch (error) {
  //     console.log('Cought error.');
  //     throw new Error(error);
  //   }
  // }

  
  /**
   * 
   * @param {*} ctx 
   * @param {*} buyer 
   * @param {*} drugName 
   * @param {*} quantity 
   */
  // async viewPurchaseOrderRequest(ctx, buyer, drugName, quantity) {
  //   try {
  //     const poKey = this.createCompositeKey(ctx, [drugName, buyer, quantity])
  //     const existingPo = await ctx.ctx.stub.getState(poKey)
  //       .catch(err => { throw new Error('Failed to fetch company. Company doesnt exist', err) });
  //     return existingPo;
  //   } catch (error) {
  //     console.log('Cought error.');
  //     throw new Error(error);
  //   }
  // }

}
module.exports = ChainCode;