/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-05-09 10:39:42
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-09 15:23:31
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, upgrades } from "hardhat";
import { RevenueTreasury, RevenueTreasury__factory } from "../../../../typechain";
import { getConfig } from "../../../entities/config";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const config = getConfig();

  const TOKEN_ADDRESS = config.Tokens.MOLE!;

  const GRASSHOUSE_ADDRESS = "0x0C15fAa3b7816940e45fe6F347cbCc75E5c7D0e0";
  const VAULT_ADDRESS = "0x7F7289819aE99E4484765936E5Be8C57EbBA4Fbe";
  const ROUTER_ADDRESS = config.Exchanges.SpookySwap?.SpookyRouter;
  const REMAINING = ethers.utils.parseEther("0");
  
  const SPLITBPS = "5000";
  
  const REWARD_PATH: string[] = [config.Tokens.MOLE!];
  const VAULT_SWAP_PATH = [config.Tokens.MOLE!] as string[];

  const deployer = (await ethers.getSigners())[0];

  console.log("> Deploying RevenueTreasury");
  const RevenueTreasury = (await ethers.getContractFactory("RevenueTreasury", deployer)) as RevenueTreasury__factory;
  const revenueTreasury = (await upgrades.deployProxy(RevenueTreasury, [
    TOKEN_ADDRESS,
    GRASSHOUSE_ADDRESS,
    REWARD_PATH,
    VAULT_ADDRESS,
    VAULT_SWAP_PATH,
    ROUTER_ADDRESS,
    REMAINING,
    SPLITBPS,
  ])) as RevenueTreasury;

  await revenueTreasury.deployTransaction.wait(3);
  console.log("RevenueTreasury:", revenueTreasury.address);
  console.log("✅ Done");
};

export default func;
func.tags = ["RevenueTreasury"];
