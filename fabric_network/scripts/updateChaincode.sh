#!/bin/bash

echo
echo " __    __      _      __    __ "
echo "/ _|  |_   |    / \    |  _ \  |   _|"
echo "\__ \    | |     / _ \   | |) |   | |  "
echo " _) |   | |    / _ \  |  _ <    | |  "
echo "|_/    ||   //   \\ || \\   |_|  "
echo
echo "Deploying Chaincode REGNET On Certification Network"
echo
CHANNEL_NAME="$1"
DELAY="$2"
LANGUAGE="$3"
VERSION="$4"
TYPE="$5"
: ${CHANNEL_NAME:="pharmachannel"}
: ${DELAY:="5"}
: ${LANGUAGE:="node"}
: ${VERSION:=1.1}
: ${TYPE="basic"}

LANGUAGE=`echo "$LANGUAGE" | tr [:upper:] [:lower:]`
ORGS="manufacturer distributor retailer consumer transporte"
TIMEOUT=15

if [ "$TYPE" = "basic" ]; then
  CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode/"
else
  CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode-advanced/"
fi

echo "Channel name : "$CHANNEL_NAME

# import utils
. scripts/utils.sh

## Install new version of chaincode on peer0 of all 3 orgs making them endorsers
echo "Installing chaincode on peer0.manufacturer.property-pharma-network.com ..."
installChaincode 0 'manufacturer' $VERSION
echo "Installing chaincode on peer0.distributor.property-pharma-network.com ..."
installChaincode 0 'distributor' $VERSION
echo "Installing chaincode on peer0.retailer.property-pharma-network.com ..."
installChaincode 0 'retailer' $VERSION
echo "Installing chaincode on peer0.consumer.property-pharma-network.com ..."
installChaincode 0 'consumer' $VERSION
echo "Installing chaincode on peer0.transporter.property-pharma-network.com ..."
installChaincode 0 'transporter' $VERSION

# Upgrade chaincode on the channel using peer0.iit
echo "Upgrading chaincode on channel using peer0.manufacturer.certification-network.com ..."
upgradeChaincode 0 'manufacturer' $VERSION

echo
echo "========= All GOOD, Chaincode CERTNET Is Now Updated To Version '$VERSION' =========== "
echo

echo
echo " __   _   _   ___   "
echo "| __| | \ | | |  _ \  "
echo "|  _|   |  \| | | | | | "
echo "| |_  | |\  | | |_| | "
echo "|__| || \_| |__/  "
echo

exit 0