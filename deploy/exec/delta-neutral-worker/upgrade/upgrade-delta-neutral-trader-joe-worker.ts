/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-05-20 14:54:21
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-20 15:19:50
 */
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
import { ConfigEntity, TimelockEntity, WorkerEntity } from "../../../entities";
import { TimelockService } from "../../../services";
import { BlockScanGasPrice } from "../../../services/gas-price/blockscan";
import { compare } from "../../../../utils/address";
import { WorkersEntity } from "../../../interfaces/config";

interface IDeltaNeutralWorkerInput {
  WORKER_NAME: string;
  IS_MASTER_CHEF_V2: boolean;
  IS_EXTEND_WORKER: boolean;
}

interface IDeltaNeutralWorkerInfo {
  WORKER_NAME: string;
  WORKER_ADDRESS: string;
  IS_MASTER_CHEF_V2: boolean;
  IS_EXTEND_WORKER: boolean;
}



const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const shortWorkerInfos: IDeltaNeutralWorkerInput[] = [
    {
      WORKER_NAME: "USDC-ETH 3x DeltaNeutralTraderJoeWorker",
      IS_MASTER_CHEF_V2: false,
      IS_EXTEND_WORKER: true
    },
    {
      WORKER_NAME: "ETH-USDC 3x DeltaNeutralTraderJoeWorker",
      IS_MASTER_CHEF_V2: false,
      IS_EXTEND_WORKER: true
    },
  ]

  const config = ConfigEntity.getConfig()
  const admin = (await ethers.getSigners())[0];

  let workers: WorkersEntity[] = [];

  config.Vaults.reduce((list, vault) => {
    list.push(...vault.workers)
    return list
  }, workers);

  const workerInfos: IDeltaNeutralWorkerInfo[] = shortWorkerInfos.map((n) => {

    const worker = workers.find(v => v.name === n.WORKER_NAME)

    if (worker === undefined) {
      throw `error: unable to find worker from ${n.WORKER_NAME}`
    }

    return {
      WORKER_NAME: n.WORKER_NAME,
      WORKER_ADDRESS: worker?.address!,
      IS_MASTER_CHEF_V2: n.IS_MASTER_CHEF_V2,
      IS_EXTEND_WORKER: n.IS_EXTEND_WORKER
    }
  })

  for (let i = 0; i < workerInfos.length; i++) {
    const workerInfo = workerInfos[i];

    if (workerInfo.IS_EXTEND_WORKER && !workerInfo.IS_MASTER_CHEF_V2) {

      console.log('>> Upgrading Delta Neutral TraderJoe V3 Worker 03e')

      const DeltaNeutralTraderJoeV3Worker03e = (
        await ethers.getContractFactory('DeltaNeutralTraderJoeV3Worker03e',admin)
      ) as DeltaNeutralTraderJoeV3Worker03e__factory;

      const perpared = await upgrades.prepareUpgrade(workerInfo.WORKER_ADDRESS,DeltaNeutralTraderJoeV3Worker03e)
      console.log(`>> Impl address : ${perpared}`)

      console.log('>> upgrading...')
      await upgrades.upgradeProxy(workerInfo.WORKER_ADDRESS,DeltaNeutralTraderJoeV3Worker03e)
      console.log("✅ Done");

    } else {
      throw `Not Support`
    }
  }

};

export default func;
func.tags = ["UpgradeDeltaNeutralTraderJoeWorker03"];
