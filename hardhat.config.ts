/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-05-24 14:22:01
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-24 14:23:34
 */
import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import "solidity-coverage";
import "@nomiclabs/hardhat-etherscan";

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      gas: 12000000,
      blockGasLimit: 0x1fffffffffffff,
      allowUnlimitedContractSize: true,
      timeout: 1800000,
      hardfork: "berlin", // use berlin in test to avoid issues with gas price 0
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        accountsBalance: "100000000000000000000000000000000000",
      },
    },
    avalanche_testnet : {
      url: process.env.AVALANCHE_TESTNET_PRC,
      accounts: [
        process.env.AVALANCHE_TESTNET_PRIVATE_KEY,
        process.env.TEST_ACCOUNT1_PRIVATE_KEY,
        process.env.TEST_ACCOUNT2_PRIVATE_KEY,
        process.env.TEST_ACCOUNT3_PRIVATE_KEY,
        process.env.TEST_ACCOUNT4_PRIVATE_KEY,
        process.env.TEST_ACCOUNT5_PRIVATE_KEY,
      ]
    },
    avalanche_mainnet : {
      url: process.env.AVALANCHE_MAINNET_RPC,
      accounts: [
        process.env.AVALANCE_MAINNET_PRIVATE_KEY
      ]
    }
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  solidity: {
    version: "0.6.6",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
      evmVersion: "istanbul",
      outputSelection: {
        "*": {
          "": ["ast"],
          "*": [
            "evm.bytecode.object",
            "evm.deployedBytecode.object",
            "abi",
            "evm.bytecode.sourceMap",
            "evm.deployedBytecode.sourceMap",
            "metadata",
          ],
        },
      },
    },
  },
  paths: {
    sources: "./contracts/6",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  typechain: {
    outDir: "./typechain",
    target: process.env.TYPECHAIN_TARGET || "ethers-v5",
  },
  mocha: {
    timeout: 100000,
  }
};
