'use strict';

const fs = require('fs');
const yaml = require('js-yaml');
const helper = require('./contractHelper');
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const { getConnectionProfilePath, getIdentityPath } = require("../config/config")


async function createContractInstance(transaction = '', ...params) {
    try {
        // Create contract Instance
        const objContract = await helper.getContractInstance(...params);
        console.log('.....Requesting to transaction on the Network');
        return transaction ? await objContract.createTransaction(transaction) : objContract;
    } catch (error) {
        console.error(error)
        throw error;
    }
}

async function addUser(org, fabricUserName, companyCRN, location, organisationRole) {
    try {

        // Create a new file system based wallet for managing identities.
        let wallet = new FileSystemWallet(getIdentityPath(org));

        // Check to see if we've already enrolled the user.
        let userExists = await wallet.exists(fabricUserName);
        if (userExists) {
            throw Error('An identity for the user already exists in the wallet');
        }

        // Check to see if we've already enrolled the user.
        userExists = await wallet.exists("admin");
        if (!userExists) {
            throw Error('Please register admin first');
        }

        // Create a new gateway for connecting to our peer node.
        let gateway = new Gateway();

        // Load connection profile; will be used to locate a gateway; The CCP is converted from YAML to JSON.
        let connectionProfile = yaml.safeLoad(fs.readFileSync(getConnectionProfilePath(org), 'utf8'));

        // Set connection options; identity and wallet
        let connectionOptions = {
            wallet: wallet,
            identity: "admin",
            discovery: { enabled: false, asLocalhost: true }
        };

        // Connect to gateway using specified parameters
        console.log('.....Connecting to Fabric Gateway');
        await gateway.connect(connectionProfile, connectionOptions);

        // Get the CA client object from the gateway for interacting with the CA.
        let ca = gateway.getClient().getCertificateAuthority();
        let adminIdentity = gateway.getCurrentIdentity();

        // Register the user, enroll the user, and import the new identity into the wallet.
        let secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: fabricUserName, role: "client", attrs: [{ name: "hf.Revoker", value: "true" }, { name: "hf.Registrar.Roles", value: "client" }] }, adminIdentity);
        let enrollment = await ca.enroll({ enrollmentID: fabricUserName, enrollmentSecret: secret });
        let userIdentity = X509WalletMixin.createIdentity(org + 'MSP', enrollment.certificate, enrollment.key.toBytes());
        await wallet.import(fabricUserName, userIdentity);

        return true;

    } catch (error) {
        console.error(error)
        throw error;
    } finally {
        // Disconnect from the fabric gateway
        helper.disconnect();
    }
}

async function addDrug(org, drugName, serialNo, mfgDate, expDate, companyCRN) {
    try {
        let txObject = await createContractInstance("", org, fabricUserName, channelName, chainCodeName, smartContractName);
        let txId = txObject.getTransactionID();
        let dataBuffer = await txObject.submit(drugName, serialNo, mfgDate, expDate, companyCRN);
        let drug = JSON.parse(dataBuffer.toString());
        drug["txId"] = txId._transaction_id;
        return drug;
    } catch (error) {
        console.error(error)
        throw error;
    } finally {
        // Disconnect from the fabric gateway
        helper.disconnect();
    }
}

async function createPurchageOrder(org, buyerCRN, sellerCRN, drugName, quantity) {
    try {
        let txObject = await createContractInstance("", org, fabricUserName, channelName, chainCodeName, smartContractName);
        let txId = txObject.getTransactionID();
        let dataBuffer = await txObject.submit(buyerCRN, sellerCRN, drugName, quantity);
        let newPO = JSON.parse(dataBuffer.toString());
        newPO["txId"] = txId._transaction_id;
        return newPO;
    } catch (error) {
        console.error(error)
        throw error;
    } finally {
        // Disconnect from the fabric gateway
        helper.disconnect();
    }
}

async function createShipment(org, buyerCRN, drugName, listOfAssets, transporterCRN) {
    try {
        let txObject = await createContractInstance("", org, fabricUserName, channelName, chainCodeName, smartContractName);
        let txId = txObject.getTransactionID();
        let dataBuffer = await txObject.submit(buyerCRN, drugName, listOfAssets, transporterCRN);
        let newShipment = JSON.parse(dataBuffer.toString());
        newShipment["txId"] = txId._transaction_id;
        return newShipment;
    } catch (error) {
        console.error(error)
        throw error;
    } finally {
        helper.disconnect();
    }
}

async function updateShipment(org, buyerCRN, drugName, transporterCRN) {
    try {
        let txObject = await createContractInstance("", org, fabricUserName, channelName, chainCodeName, smartContractName);
        let txId = txObject.getTransactionID()
        let dataBuffer = await txObject.submit(buyerCRN, drugName, transporterCRN); // check the input to provide
        let updatedShipment = JSON.parse(dataBuffer.toString());
        updatedShipment["txId"] = txId._transaction_id
        return updatedShipment;
    } catch (error) {
        console.error(error)
        throw error;
    } finally {
        helper.disconnect();
    }
}

async function retailDrug(org, drugName, serialNo, retailerCRN, customerAadhar) {
    try {



    } catch (error) {
        console.error(error)
        throw error;
    } finally {
        helper.disconnect();
    }
}

async function viewDrugHistory(org, drugName, serialNo) {
    try {
        let objContract = await createContractInstance("", org, fabricUserName, channelName, chainCodeName, smartContractName);
        console.log('.....View Data on the Network');
        let drugHistory = await objContract.evaluateTransaction('getTestDetails', testId);
        drugHistory = JSON.parse(drugHistory.toString());
        return drugHistory;
    } catch (error) {
        console.error(error)
        throw error;
    } finally {
        helper.disconnect();
    }
}

async function viewDrugCurrentState(org, drugName, serialNo) {
    try {
        // Get Channel
        var channel = await helper.getChannel(org, fabricUserName, channelName)

        // Get Tx Data
        let data = await channel.queryTransaction(txId);

        if (data) return data;
        throw Error("No Data Found")

    } catch (error) {
        console.error(error)
        throw error;
    } finally {
        helper.disconnect();
    }
}

module.exports = {
    addUser,
    addDrug,
    createPurchageOrder,
    createShipment,
    updateShipment,
    retailDrug,
    viewDrugHistory,
    viewDrugCurrentState,
}
