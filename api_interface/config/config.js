'use strict';
const path = require('path');
var PROJECT_DIR = path.resolve(__dirname, "..")

module.exports = {
    path: {
        identity: PROJECT_DIR + '/blockchain/identity/',
        connectionProfile: PROJECT_DIR + '/blockchain/connectionProfile/connection-profile-'
    },
    getIdentityPath: (org) => {
        return path.identity + org
    },
    getConnectionProfilePath: (org) => {
        return path.connectionProfile + org + '.yaml'
    }
}