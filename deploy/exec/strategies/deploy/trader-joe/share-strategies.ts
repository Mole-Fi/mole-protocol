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

  const DEPLOY_STRATS = [
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

  if (DEPLOY_STRATS.includes(Strats.btokenOnly)) {
    /**
     * Restricted StrategyAddBaseTokenOnly
     */
    console.log(">> Deploying an upgradable TraderJoe - StrategyAddBaseTokenOnly contract");
    const TraderJoeStrategyAddBaseTokenOnly = (await ethers.getContractFactory(
      "TraderJoeStrategyAddBaseTokenOnly",
      deployer
    )) as TraderJoeStrategyAddBaseTokenOnly__factory;
    const strategyAddBaseTokenOnly = (await upgrades.deployProxy(TraderJoeStrategyAddBaseTokenOnly, [
      config.Exchanges.TraderJoe!.JoeRouter,
    ])) as TraderJoeStrategyAddBaseTokenOnly;
    await strategyAddBaseTokenOnly.deployTransaction.wait(3);
    console.log(`>> Deployed at ${strategyAddBaseTokenOnly.address}`);
    console.log("✅ Done");

    if (whitelistedWorkerAddrs.length > 0) {
      console.log(">> Whitelisting workers for strategy add base token only");
      await strategyAddBaseTokenOnly.setWorkersOk(whitelistedWorkerAddrs, true);
      console.log("✅ Done");
    }
  }

  if (DEPLOY_STRATS.includes(Strats.liquidateAll)) {
    /**
     * Restricted StrategyLiquidate
     */
    console.log(">> Deploying an upgradable TraderJoe - StrategyLiquidate contract");
    const TraderJoeStrategyLiquidate = (await ethers.getContractFactory(
      "TraderJoeStrategyLiquidate",
      deployer
    )) as TraderJoeStrategyLiquidate__factory;
    const strategyLiquidate = (await upgrades.deployProxy(TraderJoeStrategyLiquidate, [
      config.Exchanges.TraderJoe!.JoeRouter,
    ])) as TraderJoeStrategyLiquidate;
    await strategyLiquidate.deployTransaction.wait(3);
    console.log(`>> Deployed at ${strategyLiquidate.address}`);
    console.log("✅ Done");

    if (whitelistedWorkerAddrs.length > 0) {
      console.log(">> Whitelisting workers for strategy liquidate");
      await strategyLiquidate.setWorkersOk(whitelistedWorkerAddrs, true);
      console.log("✅ Done");
    }
  }

  if (DEPLOY_STRATS.includes(Strats.withdrawMinimize)) {
    /**
     * Restricted StrategyWithdrawMinimizeTrading
     */
    console.log(">> Deploying an upgradable TraderJoe - StrategyWithdrawMinimizeTrading contract");
    const TraderJoeStrategyWithdrawMinimizeTrading = (await ethers.getContractFactory(
      "TraderJoeStrategyWithdrawMinimizeTrading",
      deployer
    )) as TraderJoeStrategyWithdrawMinimizeTrading__factory;
    const strategyWithdrawMinimizeTrading = (await upgrades.deployProxy(TraderJoeStrategyWithdrawMinimizeTrading, [
      config.Exchanges.TraderJoe!.JoeRouter,
      config.SharedConfig.WNativeRelayer,
    ])) as TraderJoeStrategyWithdrawMinimizeTrading;
    await strategyWithdrawMinimizeTrading.deployed();
    console.log(`>> Deployed at ${strategyWithdrawMinimizeTrading.address}`);

    if (whitelistedWorkerAddrs.length > 0) {
      console.log(">> Whitelisting workers for strategy withdraw minimize trading");
      await strategyWithdrawMinimizeTrading.setWorkersOk(whitelistedWorkerAddrs, true);
      console.log("✅ Done");
    }

    console.log(">> Whitelist StrategyWithdrawMinimizeTrading on WNativeRelayer");
    await wNativeRelayer.setCallerOk([strategyWithdrawMinimizeTrading.address], true);
    console.log("✅ Done");
  }

  if (DEPLOY_STRATS.includes(Strats.partialCloseLiquidate)) {
    /**
     * Restricted StrategyPartialCloseLiquidate
     */
    console.log(">> Deploying an upgradable TraderJoe - StrategyPartialCloseLiquidate contract");
    const TraderJoeStrategyPartialCloseLiquidate = (await ethers.getContractFactory(
      "TraderJoeStrategyPartialCloseLiquidate",
      deployer
    )) as TraderJoeStrategyPartialCloseLiquidate__factory;
    const strategyPartialCloseLiquidate = (await upgrades.deployProxy(TraderJoeStrategyPartialCloseLiquidate, [
      config.Exchanges.TraderJoe!.JoeRouter,
    ])) as TraderJoeStrategyPartialCloseLiquidate;
    await strategyPartialCloseLiquidate.deployTransaction.wait(3);
    console.log(`>> Deployed at ${strategyPartialCloseLiquidate.address}`);
    console.log("✅ Done");

    if (whitelistedWorkerAddrs.length > 0) {
      console.log(">> Whitelisting workers for strategyRestrictedLiquidate");
      await strategyPartialCloseLiquidate.setWorkersOk(whitelistedWorkerAddrs, true);
      console.log("✅ Done");
    }
  }

  if (DEPLOY_STRATS.includes(Strats.partialCloseWithdrawMinizmie)) {
    /**
     * Restricted StrategyPartialCloseMinimizeTrading
     */
    console.log(">> Deploying an upgradable TraderJoe - StrategyPartialCloseMinimizeTrading contract");
    const TraderJoeStrategyPartialCloseMinimizeTrading = (await ethers.getContractFactory(
      "TraderJoeStrategyPartialCloseMinimizeTrading",
      deployer
    )) as TraderJoeStrategyPartialCloseMinimizeTrading__factory;
    const strategyPartialCloseMinimizeTrading = (await upgrades.deployProxy(
      TraderJoeStrategyPartialCloseMinimizeTrading,
      [config.Exchanges.TraderJoe!.JoeRouter, config.SharedConfig.WNativeRelayer]
    )) as TraderJoeStrategyPartialCloseMinimizeTrading;
    await strategyPartialCloseMinimizeTrading.deployTransaction.wait(3);
    console.log(`>> Deployed at ${strategyPartialCloseMinimizeTrading.address}`);

    if (whitelistedWorkerAddrs.length > 0) {
      console.log(">> Whitelisting workers for strategy partial close minimize trading");
      await strategyPartialCloseMinimizeTrading.setWorkersOk(whitelistedWorkerAddrs, true);
      console.log("✅ Done");
    }

    console.log(">> Whitelist strategy partial close minimize trading on WNativeRelayer");
    await wNativeRelayer.setCallerOk([strategyPartialCloseMinimizeTrading.address], true);
    console.log("✅ Done");
  }
};

export default func;
func.tags = ["TraderJoeShareRestrictedStrategies"];
