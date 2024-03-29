import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, network, upgrades } from "hardhat";
import {
  ConfigurableInterestVaultConfig__factory,
  DeltaNeutralTraderJoeV2Worker03e__factory,
  DeltaNeutralTraderJoeV2Worker03__factory,
  DeltaNeutralTraderJoeV3Worker03e__factory,
  DeltaNeutralTraderJoeV3Worker03__factory,
  TraderJoeStrategyAddBaseTokenOnly__factory,
  TraderJoeStrategyAddTwoSidesOptimal__factory,
  TraderJoeStrategyLiquidate__factory,
  TraderJoeStrategyPartialCloseLiquidate__factory,
  TraderJoeStrategyPartialCloseMinimizeTrading__factory,
  TraderJoeStrategyWithdrawMinimizeTrading__factory,
  WorkerConfig__factory,
} from "../../../../typechain";
import { ConfigEntity, TimelockEntity } from "../../../entities";
import { TimelockService } from "../../../services";
import { BlockScanGasPrice } from "../../../services/gas-price/blockscan";
import { compare } from "../../../../utils/address";

interface IDeltaNeutralWorkerInput {
  VAULT_SYMBOL: string;
  WORKER_NAME: string;
  TREASURY_ADDRESS: string;
  REINVEST_BOT: string;
  POOL_ID: number;
  REINVEST_BOUNTY_BPS: string;
  REINVEST_PATH: Array<string>;
  REINVEST_THRESHOLD: string;
  REWARDER_REINVEST_BOUNTY_BPS: string;
  REWARDER_REINVEST_PATH: Array<string>;
  REWARDER_REINVEST_THRESHOLD: string;
  WORK_FACTOR: string;
  KILL_FACTOR: string;
  MAX_PRICE_DIFF: string;
  BENEFICIAL_VAULT: string;
  BENEFICIAL_VAULT_BOUNTY_BPS: string;
  BENEFICIAL_REWARD_PATH: Array<string>;
  IS_MASTER_CHEF_V2: boolean;
  IS_EXTEND_WORKER: boolean;
}

interface IDeltaNeutralWorkerInfo {
  WORKER_NAME: string;
  VAULT_CONFIG_ADDR: string;
  WORKER_CONFIG_ADDR: string;
  REINVEST_BOT: string;
  POOL_ID: number;
  VAULT_ADDR: string;
  BASE_TOKEN_ADDR: string;
  DELTA_NEUTRAL_ORACLE: string;
  MASTER_CHEF: string;
  ROUTER_ADDR: string;
  ADD_STRAT_ADDR: string;
  LIQ_STRAT_ADDR: string;
  TWO_SIDES_STRAT_ADDR: string;
  PARTIAL_CLOSE_LIQ_STRAT_ADDR: string;
  PARTIAL_CLOSE_MINIMIZE_STRAT_ADDR: string;
  MINIMIZE_TRADE_STRAT_ADDR: string;
  REINVEST_BOUNTY_BPS: string;
  REINVEST_PATH: Array<string>;
  REINVEST_THRESHOLD: string;
  REWARDER_REINVEST_BOUNTY_BPS: string;
  REWARDER_REINVEST_PATH: Array<string>;
  REWARDER_REINVEST_THRESHOLD: string;
  WORK_FACTOR: string;
  KILL_FACTOR: string;
  MAX_PRICE_DIFF: string;
  TIMELOCK: string;
  BENEFICIAL_VAULT: string;
  BENEFICIAL_VAULT_BOUNTY_BPS: string;
  BENEFICIAL_REWARD_PATH: Array<string>;
  IS_MASTER_CHEF_V2: boolean;
  IS_EXTEND_WORKER: boolean;
}

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

  const shortWorkerInfos: IDeltaNeutralWorkerInput[] = [
    //
    //    for ETH - USDC  rewarder reward ETH.e
    //
    {
      VAULT_SYMBOL: "mUSDC",
      WORKER_NAME: "USDC-ETH 3x DeltaNeutralTraderJoeWorker",
      TREASURY_ADDRESS: process.env.MOLE_BONUS_ADDRESS!,
      REINVEST_BOT: process.env.MOLE_BONUS_ADDRESS!,
      POOL_ID: 6,
      REINVEST_BOUNTY_BPS: "1500",
      REINVEST_PATH: ["JOE", "USDC"],
      REINVEST_THRESHOLD: "1",
      REWARDER_REINVEST_BOUNTY_BPS: "1500",
      REWARDER_REINVEST_PATH: ["ETH.e", "USDC"],
      REWARDER_REINVEST_THRESHOLD: "1",
      WORK_FACTOR: "8000",
      KILL_FACTOR: "0",
      MAX_PRICE_DIFF: "10500",
      BENEFICIAL_REWARD_PATH: ["JOE", "USDC"],
      BENEFICIAL_VAULT: "0x4e10192a11319fB903e67a1413ee7FAeF3Bac97b",
      BENEFICIAL_VAULT_BOUNTY_BPS: "0",
      IS_MASTER_CHEF_V2: false,
      IS_EXTEND_WORKER: true
    },
    {
      VAULT_SYMBOL: "mETH",
      WORKER_NAME: "ETH-USDC 3x DeltaNeutralTraderJoeWorker",
      TREASURY_ADDRESS: process.env.MOLE_BONUS_ADDRESS!,
      REINVEST_BOT: process.env.MOLE_BONUS_ADDRESS!,
      POOL_ID: 6,
      REINVEST_BOUNTY_BPS: "1500",
      REINVEST_PATH: ["JOE", "ETH"],
      REINVEST_THRESHOLD: "1",
      REWARDER_REINVEST_BOUNTY_BPS: "1500",
      REWARDER_REINVEST_PATH: ["ETH.e", "ETH"],
      REWARDER_REINVEST_THRESHOLD: "1",
      WORK_FACTOR: "8000",
      KILL_FACTOR: "0",
      MAX_PRICE_DIFF: "10500",
      BENEFICIAL_REWARD_PATH: ["JOE", "USDC"],
      BENEFICIAL_VAULT: "0x4e10192a11319fB903e67a1413ee7FAeF3Bac97b",
      BENEFICIAL_VAULT_BOUNTY_BPS: "0",
      IS_MASTER_CHEF_V2: false,
      IS_EXTEND_WORKER: true
    },
  ];
  // const TITLE = "mainnet_delta_neutral_3x_spooky_worker";
  const EXACT_ETA = "1646402400"; //FTM DO NOT HAVE TIMELOCK LEAVE THIS VALUE

  const deployer = (await ethers.getSigners())[0];
  const timelockTransactions: Array<TimelockEntity.Transaction> = [];
  // const gasPriceService = new BlockScanGasPrice(network.name);
  // const gasPrice = await gasPriceService.getFastGasPrice();
  const workerInfos: IDeltaNeutralWorkerInfo[] = shortWorkerInfos.map((n) => {
    const vault = config.Vaults.find((v) => v.symbol === n.VAULT_SYMBOL);
    if (vault === undefined) {
      throw `error: unable to find vault from ${n.VAULT_SYMBOL}`;
    }

    const tokenList: any = config.Tokens;
    const reinvestPath: Array<string> = n.REINVEST_PATH.map((p) => {
      const addr = tokenList[p];
      if (addr === undefined) {
        throw `error: path: unable to find address of ${p}`;
      }
      return addr;
    });

    const rewarderReinvestPath: Array<string> = n.REWARDER_REINVEST_PATH.map((p) => {
      const addr = tokenList[p];
      if (addr === undefined) {
        throw `error: path: unable to find address of ${p}`;
      }
      return addr;
    })

    const beneficialRewardPath: Array<string> = n.BENEFICIAL_REWARD_PATH.map((p) => {
      const addr = tokenList[p];
      if (addr === undefined) {
        throw `error: path: unable to find address of ${p}`;
      }
      return addr;
    });

    return {
      WORKER_NAME: n.WORKER_NAME,
      VAULT_CONFIG_ADDR: vault.config,
      WORKER_CONFIG_ADDR: config.SharedConfig.WorkerConfig,
      REINVEST_BOT: n.REINVEST_BOT,
      POOL_ID: n.POOL_ID,
      VAULT_ADDR: vault.address,
      BASE_TOKEN_ADDR: vault.baseToken,
      DELTA_NEUTRAL_ORACLE: config.Oracle.DeltaNeutralOracle!,
      MASTER_CHEF: n.IS_MASTER_CHEF_V2 ? config.Exchanges.TraderJoe!.MasterChefJoeV2! : config.Exchanges.TraderJoe?.MasterChefJoeV3!,
      ROUTER_ADDR: config.Exchanges.TraderJoe!.JoeRouter,
      ADD_STRAT_ADDR: config.SharedStrategies.TraderJoe!.StrategyAddBaseTokenOnly,
      LIQ_STRAT_ADDR: config.SharedStrategies.TraderJoe!.StrategyLiquidate,
      TWO_SIDES_STRAT_ADDR: vault.StrategyAddTwoSidesOptimal.TraderJoe!,
      PARTIAL_CLOSE_LIQ_STRAT_ADDR: config.SharedStrategies.TraderJoe!.StrategyPartialCloseLiquidate,
      PARTIAL_CLOSE_MINIMIZE_STRAT_ADDR: config.SharedStrategies.TraderJoe!.StrategyPartialCloseMinimizeTrading,
      MINIMIZE_TRADE_STRAT_ADDR: config.SharedStrategies.TraderJoe!.StrategyWithdrawMinimizeTrading,
      REINVEST_BOUNTY_BPS: n.REINVEST_BOUNTY_BPS,
      REINVEST_PATH: reinvestPath,
      REINVEST_THRESHOLD: ethers.utils.parseEther(n.REINVEST_THRESHOLD).toString(),
      REWARDER_REINVEST_BOUNTY_BPS: n.REWARDER_REINVEST_BOUNTY_BPS,
      REWARDER_REINVEST_PATH: rewarderReinvestPath,
      REWARDER_REINVEST_THRESHOLD: ethers.utils.parseEther(n.REWARDER_REINVEST_THRESHOLD).toString(),
      WORK_FACTOR: n.WORK_FACTOR,
      KILL_FACTOR: n.KILL_FACTOR,
      MAX_PRICE_DIFF: n.MAX_PRICE_DIFF,
      TIMELOCK: config.Timelock,
      BENEFICIAL_VAULT: n.BENEFICIAL_VAULT,
      BENEFICIAL_VAULT_BOUNTY_BPS: n.BENEFICIAL_VAULT_BOUNTY_BPS,
      BENEFICIAL_REWARD_PATH: beneficialRewardPath,
      IS_MASTER_CHEF_V2: n.IS_MASTER_CHEF_V2,
      IS_EXTEND_WORKER: n.IS_EXTEND_WORKER
    };
  });
  for (let i = 0; i < workerInfos.length; i++) {
    const workerInfo = workerInfos[i];
    console.log("===================================================================================");
    console.log(`>> Deploying an upgradable TraderJoeWorker contract for ${workerInfos[i].WORKER_NAME}`);

    let DeltaNeutralTraderJoeWorker;

    if (workerInfo.IS_MASTER_CHEF_V2) {
      if (workerInfo.IS_EXTEND_WORKER) {
        DeltaNeutralTraderJoeWorker = (await ethers.getContractFactory("DeltaNeutralTraderJoeV2Worker03e", deployer)) as DeltaNeutralTraderJoeV2Worker03e__factory
      } else {
        DeltaNeutralTraderJoeWorker = (await ethers.getContractFactory("DeltaNeutralTraderJoeV2Worker03", deployer)) as DeltaNeutralTraderJoeV2Worker03__factory
      }
    } else {
      if (workerInfo.IS_EXTEND_WORKER) {
        DeltaNeutralTraderJoeWorker = (await ethers.getContractFactory("DeltaNeutralTraderJoeV3Worker03e", deployer)) as DeltaNeutralTraderJoeV3Worker03e__factory
      } else {
        DeltaNeutralTraderJoeWorker = (await ethers.getContractFactory("DeltaNeutralTraderJoeV3Worker03", deployer)) as DeltaNeutralTraderJoeV3Worker03__factory
      }
    }

    const deltaNeutralWorker = (await upgrades.deployProxy(DeltaNeutralTraderJoeWorker, [
      workerInfo.VAULT_ADDR,
      workerInfo.BASE_TOKEN_ADDR,
      workerInfo.MASTER_CHEF,
      workerInfo.ROUTER_ADDR,
      workerInfo.POOL_ID,
      workerInfo.ADD_STRAT_ADDR,
      workerInfo.REINVEST_BOUNTY_BPS,
      deployer.address,
      workerInfo.REINVEST_PATH,
      workerInfo.REINVEST_THRESHOLD,
      workerInfo.DELTA_NEUTRAL_ORACLE,
    ]));

    const deployTxReceipt = await deltaNeutralWorker.deployTransaction.wait(3);
    console.log(`>> Deployed at ${deltaNeutralWorker.address}`);
    console.log(`>> Deployed block: ${deployTxReceipt.blockNumber}`);

    let nonce = await deployer.getTransactionCount();

    if (workerInfo.IS_EXTEND_WORKER) {
      console.log(`>> Config rewarder reinvest for extend worker`)
      await deltaNeutralWorker.setRewarderReinvestConfig(workerInfo.REWARDER_REINVEST_BOUNTY_BPS, workerInfo.REWARDER_REINVEST_THRESHOLD, workerInfo.REWARDER_REINVEST_PATH, { nonce: nonce++ });
      console.log("✅ Done");
    }

    console.log(`>> Adding REINVEST_BOT`);
    await deltaNeutralWorker.setReinvestorOk([workerInfo.REINVEST_BOT], true, { nonce: nonce++ });
    console.log("✅ Done");

    console.log(`>> Adding Treasuries`);
    await deltaNeutralWorker.setTreasuryConfig(workerInfo.REINVEST_BOT, workerInfo.REINVEST_BOUNTY_BPS, {

      nonce: nonce++,
    });
    console.log("✅ Done");

    console.log(`>> Adding Strategies`);
    const okStrats = [workerInfo.LIQ_STRAT_ADDR, workerInfo.TWO_SIDES_STRAT_ADDR, workerInfo.MINIMIZE_TRADE_STRAT_ADDR];
    if (workerInfo.PARTIAL_CLOSE_LIQ_STRAT_ADDR != "") {
      okStrats.push(workerInfo.PARTIAL_CLOSE_LIQ_STRAT_ADDR);
    }
    if (workerInfo.PARTIAL_CLOSE_MINIMIZE_STRAT_ADDR != "") {
      okStrats.push(workerInfo.PARTIAL_CLOSE_MINIMIZE_STRAT_ADDR);
    }

    await deltaNeutralWorker.setStrategyOk(okStrats, true, { nonce: nonce++ });
    console.log("✅ Done");

    console.log(`>> Whitelisting a worker on strats`);
    const addStrat = TraderJoeStrategyAddBaseTokenOnly__factory.connect(workerInfo.ADD_STRAT_ADDR, deployer);
    await addStrat.setWorkersOk([deltaNeutralWorker.address], true, { nonce: nonce++ });
    const liqStrat = TraderJoeStrategyLiquidate__factory.connect(workerInfo.LIQ_STRAT_ADDR, deployer);

    await liqStrat.setWorkersOk([deltaNeutralWorker.address], true, { nonce: nonce++ });

    const twoSidesStrat = TraderJoeStrategyAddTwoSidesOptimal__factory.connect(
      workerInfo.TWO_SIDES_STRAT_ADDR,
      deployer
    );

    await twoSidesStrat.setWorkersOk([deltaNeutralWorker.address], true, { nonce: nonce++ });
    const minimizeStrat = TraderJoeStrategyWithdrawMinimizeTrading__factory.connect(
      workerInfo.MINIMIZE_TRADE_STRAT_ADDR,
      deployer
    );
    await minimizeStrat.setWorkersOk([deltaNeutralWorker.address], true, { nonce: nonce++ });

    if (workerInfo.PARTIAL_CLOSE_LIQ_STRAT_ADDR != "") {
      console.log(">> partial close liquidate is deployed");
      const partialCloseLiquidate = TraderJoeStrategyPartialCloseLiquidate__factory.connect(
        workerInfo.PARTIAL_CLOSE_LIQ_STRAT_ADDR,
        deployer
      );
      await partialCloseLiquidate.setWorkersOk([deltaNeutralWorker.address], true, { nonce: nonce++ });
    }

    if (workerInfo.PARTIAL_CLOSE_MINIMIZE_STRAT_ADDR != "") {
      console.log(">> partial close minimize is deployed");
      const partialCloseMinimize = TraderJoeStrategyPartialCloseMinimizeTrading__factory.connect(
        workerInfo.PARTIAL_CLOSE_MINIMIZE_STRAT_ADDR,
        deployer
      );
      await partialCloseMinimize.setWorkersOk([deltaNeutralWorker.address], true, { nonce: nonce++ });
    }

    console.log(">> setBeneficialVaultConfig");
    await deltaNeutralWorker.setBeneficialVaultConfig(
      workerInfo.BENEFICIAL_VAULT_BOUNTY_BPS,
      workerInfo.BENEFICIAL_VAULT,
      workerInfo.BENEFICIAL_REWARD_PATH,
      {
        nonce: nonce++,
      }
    );

    console.log("✅ Done");

    console.log(">> Timelock PART");

    const workerConfig = WorkerConfig__factory.connect(workerInfo.WORKER_CONFIG_ADDR, deployer);

    const isTimelockedWorkerConfig = compare(await workerConfig.owner(), config.Timelock);

    if (isTimelockedWorkerConfig) {
      timelockTransactions.push(
        await TimelockService.queueTransaction(
          `>> Queue tx on Timelock Setting WorkerConfig via Timelock at ${workerInfo.WORKER_CONFIG_ADDR} for ${deltaNeutralWorker.address}`,
          workerInfo.WORKER_CONFIG_ADDR,
          "0",
          "setConfigs(address[],(bool,uint64,uint64,uint64)[])",
          ["address[]", "(bool acceptDebt,uint64 workFactor,uint64 killFactor,uint64 maxPriceDiff)[]"],
          [
            [deltaNeutralWorker.address],
            [
              {
                acceptDebt: true,
                workFactor: workerInfo.WORK_FACTOR,
                killFactor: workerInfo.KILL_FACTOR,
                maxPriceDiff: workerInfo.MAX_PRICE_DIFF,
              },
            ],
          ],
          EXACT_ETA,
          { nonce: nonce++ }
        )
      );
      console.log("✅ Done");
    } else {
      console.log(`>> Set WorkerConfig ${workerInfo.WORKER_CONFIG_ADDR} for ${deltaNeutralWorker.address}`);
      await workerConfig.setConfigs(
        [deltaNeutralWorker.address],
        [
          {
            acceptDebt: true,
            workFactor: workerInfo.WORK_FACTOR,
            killFactor: workerInfo.KILL_FACTOR,
            maxPriceDiff: workerInfo.MAX_PRICE_DIFF,
          },
        ],
        { nonce: nonce++ }
      );
    }

    const vaultConfig = ConfigurableInterestVaultConfig__factory.connect(workerInfo.VAULT_CONFIG_ADDR, deployer);

    const isTimeLockVaultConfig = compare(await vaultConfig.owner(), config.Timelock);

    if (isTimeLockVaultConfig) {
      timelockTransactions.push(
        await TimelockService.queueTransaction(
          `>> Queue tx on Timelock Linking VaultConfig with WorkerConfig via Timelock for ${workerInfo.VAULT_CONFIG_ADDR}`,
          workerInfo.VAULT_CONFIG_ADDR,
          "0",
          "setWorkers(address[],address[])",
          ["address[]", "address[]"],
          [[deltaNeutralWorker.address], [workerInfo.WORKER_CONFIG_ADDR]],
          EXACT_ETA,
          { nonce: nonce++ }
        )
      );
      console.log("✅ Done");
    } else {
      console.log(`>> Set VaultConfig for ${workerInfo.VAULT_CONFIG_ADDR}`);
      await vaultConfig.setWorkers([deltaNeutralWorker.address], [workerInfo.WORKER_CONFIG_ADDR]);
    }

    if (isTimelockedWorkerConfig || isTimeLockVaultConfig) {
      // fileService.writeJson(TITLE, timelockTransactions);
    }
  }
};

export default func;
func.tags = ["DeltaNeutralTraderJoeWorker03"];
