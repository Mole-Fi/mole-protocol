/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-02-22 14:19:42
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-23 10:06:04
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
      VAULT_SYMBOL: "mWAVAX",
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

    console.log(">> Deploying an upgradable TraderJoe - StrategyAddTwoSidesOptimal contract");
    const TraderJoeStrategyAddTwoSidesOptimal = (await ethers.getContractFactory(
      "TraderJoeStrategyAddTwoSidesOptimal",
      deployer
    )) as TraderJoeStrategyAddTwoSidesOptimal__factory;
    const strategyAddTwoSidesOptimal = (await upgrades.deployProxy(TraderJoeStrategyAddTwoSidesOptimal, [
      config.Exchanges.TraderJoe!.JoeRouter,
      targetedVault.address,
    ])) as TraderJoeStrategyAddTwoSidesOptimal;
    await strategyAddTwoSidesOptimal.deployTransaction.wait(5);
    console.log(`>> Deployed at ${strategyAddTwoSidesOptimal.address}`);

    if (NEW_PARAMS[i].WHITELIST_WORKERS.length > 0) {
      console.log(">> Whitelisting Workers");
      const tx = await strategyAddTwoSidesOptimal.setWorkersOk(NEW_PARAMS[i].WHITELIST_WORKERS, true);
      await tx.wait(5);
      console.log(">> Done at: ", tx.hash);
    }
  }
};

export default func;
func.tags = ["TraderJoeRestrictedVaultStrategies"];
