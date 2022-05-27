import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, upgrades } from "hardhat";
import {
  TraderJoeStrategyAddBaseTokenOnly,
  TraderJoeStrategyAddBaseTokenOnly__factory,
  TraderJoeStrategyLiquidate,
  TraderJoeStrategyLiquidate__factory,
  TraderJoeStrategyPartialCloseLiquidate,
  TraderJoeStrategyPartialCloseLiquidate__factory,
  TraderJoeStrategyPartialCloseMinimizeTrading,
  TraderJoeStrategyPartialCloseMinimizeTrading__factory,
  TraderJoeStrategyWithdrawMinimizeTrading,
  TraderJoeStrategyWithdrawMinimizeTrading__factory,
  WNativeRelayer__factory,
} from "../../../../../typechain";
import { Strats } from "../../../../entities/strats";
import { getConfig } from "../../../../entities/config";
import { mapWorkers } from "../../../../entities/worker";

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

  const UPGRADE_STRATS = [
    Strats.btokenOnly,
    Strats.liquidateAll,
    Strats.withdrawMinimize,
    Strats.partialCloseLiquidate,
    Strats.partialCloseWithdrawMinizmie,
  ];
  const WHITELIST_WORKERS: string[] = [];

  const config = getConfig();
  const whitelistedWorkerAddrs = mapWorkers(WHITELIST_WORKERS).map((w) => w.address);
  const deployer = admin;
  const wNativeRelayer = WNativeRelayer__factory.connect(config.SharedConfig.WNativeRelayer, deployer);

  if (UPGRADE_STRATS.includes(Strats.btokenOnly)) {
    /**
     * Restricted StrategyAddBaseTokenOnly
     */
    console.log(">> Upgrading an upgradable TraderJoe - StrategyAddBaseTokenOnly contract");
    const TraderJoeStrategyAddBaseTokenOnly = (await ethers.getContractFactory(
      "TraderJoeStrategyAddBaseTokenOnly",
      deployer
    )) as TraderJoeStrategyAddBaseTokenOnly__factory;
    const address = config.SharedStrategies.TraderJoe!.StrategyAddBaseTokenOnly!;
    const perpared = await upgrades.prepareUpgrade(address,TraderJoeStrategyAddBaseTokenOnly);
    console.log(`>> Implementation address: ${perpared}`)
    console.log("✅ Done");

    console.log('>> Upgrade')
    await upgrades.upgradeProxy(address,TraderJoeStrategyAddBaseTokenOnly)
    console.log("✅ Done");
  }

  if (UPGRADE_STRATS.includes(Strats.liquidateAll)) {
    /**
     * Restricted StrategyLiquidate
     */
    console.log(">> Upgrading an upgradable TraderJoe - StrategyLiquidate contract");
    const TraderJoeStrategyLiquidate = (await ethers.getContractFactory(
      "TraderJoeStrategyLiquidate",
      deployer
    )) as TraderJoeStrategyLiquidate__factory;
    
    const address = config.SharedStrategies.TraderJoe!.StrategyLiquidate!;
    const perpared = await upgrades.prepareUpgrade(address,TraderJoeStrategyLiquidate);
    console.log(`>> Implementation address: ${perpared}`)
    console.log("✅ Done");

    console.log('>> Upgrade')
    await upgrades.upgradeProxy(address,TraderJoeStrategyLiquidate)
    console.log("✅ Done");
    
  }

  if (UPGRADE_STRATS.includes(Strats.withdrawMinimize)) {
    /**
     * Restricted StrategyWithdrawMinimizeTrading
     */
    console.log(">> Upgrading an upgradable TraderJoe - StrategyWithdrawMinimizeTrading contract");
    const TraderJoeStrategyWithdrawMinimizeTrading = (await ethers.getContractFactory(
      "TraderJoeStrategyWithdrawMinimizeTrading",
      deployer
    )) as TraderJoeStrategyWithdrawMinimizeTrading__factory;
    
    const address = config.SharedStrategies.TraderJoe!.StrategyWithdrawMinimizeTrading!;
    const perpared = await upgrades.prepareUpgrade(address,TraderJoeStrategyWithdrawMinimizeTrading);
    console.log(`>> Implementation address: ${perpared}`)
    console.log("✅ Done");

    console.log('>> Upgrade')
    await upgrades.upgradeProxy(address,TraderJoeStrategyWithdrawMinimizeTrading)
    console.log("✅ Done");
  }

  if (UPGRADE_STRATS.includes(Strats.partialCloseLiquidate)) {
    /**
     * Restricted StrategyPartialCloseLiquidate
     */
    console.log(">> Upgrading an upgradable TraderJoe - StrategyPartialCloseLiquidate contract");
    const TraderJoeStrategyPartialCloseLiquidate = (await ethers.getContractFactory(
      "TraderJoeStrategyPartialCloseLiquidate",
      deployer
    )) as TraderJoeStrategyPartialCloseLiquidate__factory;
   
    const address = config.SharedStrategies.TraderJoe!.StrategyPartialCloseLiquidate!;
    const perpared = await upgrades.prepareUpgrade(address,TraderJoeStrategyPartialCloseLiquidate);
    console.log(`>> Implementation address: ${perpared}`)
    console.log("✅ Done");

    console.log('>> Upgrade')
    await upgrades.upgradeProxy(address,TraderJoeStrategyPartialCloseLiquidate)
    console.log("✅ Done");
  }

  if (UPGRADE_STRATS.includes(Strats.partialCloseWithdrawMinizmie)) {
    /**
     * Restricted StrategyPartialCloseMinimizeTrading
     */
    console.log(">> Upgrading an upgradable TraderJoe - StrategyPartialCloseMinimizeTrading contract");
    const TraderJoeStrategyPartialCloseMinimizeTrading = (await ethers.getContractFactory(
      "TraderJoeStrategyPartialCloseMinimizeTrading",
      deployer
    )) as TraderJoeStrategyPartialCloseMinimizeTrading__factory;

    const address = config.SharedStrategies.TraderJoe!.StrategyPartialCloseMinimizeTrading!;
    const perpared = await upgrades.prepareUpgrade(address,TraderJoeStrategyPartialCloseMinimizeTrading);
    console.log(`>> Implementation address: ${perpared}`)
    console.log("✅ Done");

    console.log('>> Upgrade')
    await upgrades.upgradeProxy(address,TraderJoeStrategyPartialCloseMinimizeTrading)
    console.log("✅ Done");
  }
};

export default func;
func.tags = ["UpgradeTraderJoeShareRestrictedStrategiesWithoutTimeLock"];
