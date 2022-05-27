/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-02-22 14:19:42
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-17 15:15:53
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, upgrades, network } from "hardhat";
import {
  TraderJoeStrategyAddTwoSidesOptimal,
  TraderJoeStrategyAddTwoSidesOptimal__factory,
} from "../../../../../typechain";
import { ConfigEntity } from "../../../../entities";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
  ░██╗░░░░░░░██╗░█████╗░██████╗░███╗░░██╗██╗███╗░░██╗░██████╗░
  ░██║░░██╗░░██║██╔══██╗██╔══██╗████╗░██║██║████╗░██║██╔════╝░
  ░╚██╗████╗██╔╝███████║██████╔╝██╔██╗██║██║██╔██╗██║██║░░██╗░
  ░░████╔═████║░██╔══██║██╔══██╗██║╚████║██║██║╚████║██║░░╚██╗
  ░░╚██╔╝░╚██╔╝░██║░░██║██║░░██║██║░╚███║██║██║░╚███║╚██████╔╝
  ░░░╚═╝░░░╚═╝░░╚═╝░░╚═╝╚═╝░░╚═╝╚═╝░░╚══╝╚═╝╚═╝░░╚══╝░╚═════╝░
  Check all variables below before execute the deployment script
  */
  const [admin,] = await ethers.getSigners()

  const NEW_PARAMS = [
    {
      VAULT_SYMBOL: "mUSDt",
      WHITELIST_WORKERS: [],
    },
    {
      VAULT_SYMBOL: "mUSDC",
      WHITELIST_WORKERS: [],
    },
  ];

  const config = ConfigEntity.getConfig();
  const deployer = admin;

  for (let i = 0; i < NEW_PARAMS.length; i++) {
    const targetedVault = config.Vaults.find((v) => v.symbol === NEW_PARAMS[i].VAULT_SYMBOL);
    if (targetedVault === undefined) {
      throw `error: not found vault based on ${NEW_PARAMS[i].VAULT_SYMBOL}`;
    }
    if (targetedVault.address === "") {
      throw `error: no address`;
    }
    const addTwoSidesAddress = targetedVault.StrategyAddTwoSidesOptimal.TraderJoe!
    if(!addTwoSidesAddress){
      throw `error: no strategy.`
    }
    
    console.log(">> Upgrading an upgradable TraderJoe - StrategyAddTwoSidesOptimal contract");
    
    const TraderJoeStrategyAddTwoSidesOptimal = (await ethers.getContractFactory(
      "TraderJoeStrategyAddTwoSidesOptimal",
      deployer
    )) as TraderJoeStrategyAddTwoSidesOptimal__factory;

    const perpared = await upgrades.prepareUpgrade(addTwoSidesAddress,TraderJoeStrategyAddTwoSidesOptimal)
    console.log(`>> Implementation address: ${perpared}`)
    console.log("✅ Done");

    console.log(">> Upgrading")
    await upgrades.upgradeProxy(addTwoSidesAddress,TraderJoeStrategyAddTwoSidesOptimal)
    console.log("✅ Done");

  }
};

export default func;
func.tags = ["UpgradeTraderJoeRestrictedVaultStrategiesWithoutTimeLock"];
