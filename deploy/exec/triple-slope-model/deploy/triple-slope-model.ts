/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-03-16 20:44:13
 * @LastEditors: Hungry
 * @LastEditTime: 2022-03-17 20:46:07
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const [admin,] = await ethers.getSigners()

  console.log("> Deploying TripleSlopeModel");
  const TripleSlopeModel = await ethers.getContractFactory("TripleSlopeModel", admin);
  const tripleSlopeModel = await TripleSlopeModel.deploy();
  console.log("> TripleSlopeModel deployed at", tripleSlopeModel.address);
};

export default func;
func.tags = ["TripleSlopeModel"];
