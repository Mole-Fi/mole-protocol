/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-02-22 14:19:42
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-18 20:15:17
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, upgrades, network } from "hardhat";
import { ConfigurableInterestVaultConfig__factory } from "../../../../typechain";
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
  const [admin] = await ethers.getSigners()

  const config = ConfigEntity.getConfig();

  const MIN_DEBT_SIZE = ethers.utils.parseUnits('0.01',18);
  // const MIN_DEBT_SIZE = 50 * 1e6; 
  const RESERVE_POOL_BPS = "1900";
  const KILL_PRIZE_BPS = "100";
  const TREASURY_KILL_BPS = "400";
  const TREASURY_ADDR = process.env.MOLE_BONUS_ADDRESS;

  const TRIPLE_SLOPE_MODEL = config.SharedConfig.TripleSlopeModel;
  const WNATIVE = config.Tokens.WAVAX!;
  const FAIR_LAUNCH = config.FairLaunch!.address;

  if(!TREASURY_ADDR){
    throw 'Treasury not set.'
  }

  console.log(">> Deploying an upgradable configurableInterestVaultConfig contract");
  const ConfigurableInterestVaultConfig = (await ethers.getContractFactory(
    "ConfigurableInterestVaultConfig",
    admin
  )) as ConfigurableInterestVaultConfig__factory;
  const configurableInterestVaultConfig = await upgrades.deployProxy(ConfigurableInterestVaultConfig, [
    MIN_DEBT_SIZE,
    RESERVE_POOL_BPS,
    KILL_PRIZE_BPS,
    TRIPLE_SLOPE_MODEL,
    WNATIVE,
    config.SharedConfig.WNativeRelayer,
    FAIR_LAUNCH,
    TREASURY_KILL_BPS,
    TREASURY_ADDR,
  ]);
  await configurableInterestVaultConfig.deployed();
  console.log(`>> Deployed at ${configurableInterestVaultConfig.address}`);
};

export default func;
func.tags = ["ConfigurableInterestVaultConfig"];
