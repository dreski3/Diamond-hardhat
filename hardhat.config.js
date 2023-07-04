
/* global ethers task */
require('@nomiclabs/hardhat-waffle');
require("@nomicfoundation/hardhat-verify");

const SEPOLIA_PRIVATE_KEY = "ff30fa35f978587c0eee791fb50a5932ab256fe6da17da2910b69f4f647e55e4";
const ALCHEMY_SEPOLIA_API_KEY = "u9uDnCYdJLpSerV7TOkZBF2EE7ACyjUF";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async () => {
  const accounts = await ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: '0.8.17',
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  defaultNetwork: 'sepolia',
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_SEPOLIA_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: "43VDY93T5B75DEMP74JKKSFH95EJPIH8CP",
  },
}
