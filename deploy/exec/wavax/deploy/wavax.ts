/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-05-13 09:12:42
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-13 14:41:03
 */


import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { WAVAX__factory, } from "../../../../typechain";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const [admin,] = await ethers.getSigners()

  console.log("> Deploying WAVAX");
  const WAVAX = (await ethers.getContractFactory("WAVAX", admin)) as WAVAX__factory;
  const wAVAX = await WAVAX.deploy();
  await wAVAX.deployTransaction.wait(3);
  console.log("✅ Done");
  console.log("> WAVAX address:", wAVAX.address);
};

export default func;
func.tags = ["WAVAX"];

