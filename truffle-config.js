const HDWalletProvider = require('truffle-hdwallet-provider-privkey');
const { privateKey, endpoint } = require('./secrets.json');

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    develop: {
      port: 8545
    },
    kovan: {
      provider: function() {
        return new HDWalletProvider(
          [privateKey],
          endpoint
        )
      },
      gas: 5000000,
      gasPrice: 25000000000,
      network_id: 42
    }
  },
  compilers: {
    solc: {
      version: "0.8.4",
    },
  },
};
