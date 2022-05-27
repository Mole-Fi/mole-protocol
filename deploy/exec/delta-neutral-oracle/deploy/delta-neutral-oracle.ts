/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-04-18 13:47:43
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-24 15:25:43
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, upgrades } from "hardhat";
import { DeltaNeutralOracle, DeltaNeutralOracle__factory, Timelock__factory } from "../../../../typechain";
import { ConfigEntity } from "../../../entities";

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
  const config = ConfigEntity.getConfig();
  //FIXME:only for testnet
  const CHAINLINK_ADDRESS = config.Oracle.OracleMedianizer;
  const USD = config.Tokens.USD;

  const deployer = (await ethers.getSigners())[0];

  console.log(">> Deploying an upgradable DeltaNeutralOracle contract");
  const DeltaNeutralOracle = (await ethers.getContractFactory(
    "DeltaNeutralOracle",
    deployer
  )) as DeltaNeutralOracle__factory;
  const deltaNeutralOracle = (await upgrades.deployProxy(DeltaNeutralOracle, [
    CHAINLINK_ADDRESS,
    USD,
  ])) as DeltaNeutralOracle;

  await deltaNeutralOracle.deployTransaction.wait(3);
  console.log(`>> Deployed at ${deltaNeutralOracle.address}`);
  console.log("✅ Done");
};

export default func;
func.tags = ["DeltaNeutralOracle"];
