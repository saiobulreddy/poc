I have created the enough setup i can for makeing the better understanding about how a blockchain network can build using docker and how a chain can be like as well as the nodejs app building to intract with the blockchain network and the identities that we can create and store inside of a wallet of us.

It's just to showcase my knowledge, but still have some pending and not at completely done and tested.


for the blockchain network you run the following commands to setup the newtwork to create all the peers and channels

- move to fabric_network folder
- create channel-artifacts if not exist
- mkdir channel-artifacts
- give r/w purmissions to all the files
- chmod -R 777 ./
- run bleow command to generate the channel-artifacts and crypto materials
- ./fabricNetwork.sh genertat
- run the below command to create the containers for all the network components with channel to up the network
- fabricNetwork.sh up
- run the below command to install and instantiate the chaincode
- fabricNetwork.sh install
- run the below command to down the network
- fabricNetwork.sh down
