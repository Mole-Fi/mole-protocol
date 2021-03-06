/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-02-22 14:19:42
 * @LastEditors: Hungry
 * @LastEditTime: 2022-03-17 20:46:03
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { Timelock__factory } from "../../../../typechain";

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

  const ADMIN_ADDRESS = admin.address;
  const DELAY_IN_DAYS = 1;

  console.log("> Deploying Timelock");
  const Timelock = (await ethers.getContractFactory("Timelock", admin)) as Timelock__factory;
  const timelock = await Timelock.deploy(ADMIN_ADDRESS, DELAY_IN_DAYS * 24 * 60 * 60);
  console.log(`> Timelock is deployed at: ${timelock.address}`);
};

export default func;
func.tags = ["Timelock"];
