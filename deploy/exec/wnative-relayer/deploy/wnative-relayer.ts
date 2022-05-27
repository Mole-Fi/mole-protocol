/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-03-16 20:44:13
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-13 16:45:49
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { WNativeRelayer__factory } from "../../../../typechain";
import { getConfig } from "../../../entities/config";

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

  const config = getConfig();
  const WNATIVE_ADDR = config.Tokens.WAVAX!;

  if(!WNATIVE_ADDR){
    throw `!WNATIVE_ADDR`;
  }

  console.log("> Deploying WNativeRelayer");
  const WNativeRelayer = (await ethers.getContractFactory("WNativeRelayer", admin)) as WNativeRelayer__factory;
  const wnativeRelayer = await WNativeRelayer.deploy(WNATIVE_ADDR);
  console.log("> WNativeRelayer deployed at", wnativeRelayer.address);
};

export default func;
func.tags = ["WNativeRelayer"];
