/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-03-16 20:44:13
 * @LastEditors: Hungry
 * @LastEditTime: 2022-03-17 20:45:39
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, upgrades } from "hardhat";
import { OracleMedianizer__factory } from "../../../../typechain";

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

  console.log(">> Deploying an upgradable OracleMedianizer contract");
  const OracleMedianizer = (await ethers.getContractFactory(
    "OracleMedianizer",
    admin
  )) as OracleMedianizer__factory;
  const oracleMedianizer = await upgrades.deployProxy(OracleMedianizer);
  await oracleMedianizer._deployed();
  console.log(`>> Deployed at ${oracleMedianizer.address}`);
};

export default func;
func.tags = ["OracleMedianizer"];
