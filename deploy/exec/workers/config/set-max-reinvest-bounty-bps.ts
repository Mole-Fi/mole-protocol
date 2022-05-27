/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-03-16 20:44:13
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-24 15:16:57
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, network } from "hardhat";
import { ConfigEntity, TimelockEntity } from "../../../entities";
import { FileService, TimelockService } from "../../../services";

interface IWorker {
  WORKER_NAME: string;
  ADDRESS: string;
}

type IWorkers = Array<IWorker>;

/**
 * @description Deployment script for setting workers' beneficial vault related data
 * @param  {HardhatRuntimeEnvironment} hre
 */
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
  const fileName = "mainnet-xMOLE-set-max-reinvest-bounty-bps";
  const workerInputs: Array<string> = [
    "USDT-BTCB Worker",
  ];
  const MAX_REINVEST_BOUNTY_BPS = "900";
  const EXACT_ETA = "1639720800";

  const config = ConfigEntity.getConfig()
  const allWorkers: IWorkers = config.Vaults.reduce((accum, vault) => {
    return accum.concat(
      vault.workers.map((worker) => {
        return {
          WORKER_NAME: worker.name,
          ADDRESS: worker.address,
        };
      })
    );
  }, [] as IWorkers);

  const TO_BE_UPDATED_WORKERS: IWorkers = workerInputs.map((workerInput) => {
    // 1. find each worker having an identical name as workerInput
    // 2. if hit return
    // 3. other wise throw error
    const hit = allWorkers.find((worker) => {
      return worker.WORKER_NAME === workerInput;
    });

    if (!!hit) return hit;

    throw new Error(`could not find ${workerInput}`);
  });

  const deployer = (await ethers.getSigners())[0];
  const timelockTransactions: Array<TimelockEntity.Transaction> = [];
  let nonce = await deployer.getTransactionCount();

  for (let i = 0; i < TO_BE_UPDATED_WORKERS.length; i++) {
    timelockTransactions.push(
      await TimelockService.queueTransaction(
        `setting max reinvest bounty bps for ${TO_BE_UPDATED_WORKERS[i].WORKER_NAME}`,
        TO_BE_UPDATED_WORKERS[i].ADDRESS,
        "0",
        "setMaxReinvestBountyBps(uint256)",
        ["uint256"],
        [MAX_REINVEST_BOUNTY_BPS],
        EXACT_ETA,
        { nonce: nonce++, gasPrice: ethers.utils.parseUnits("10", "gwei") }
      )
    );
  }

  FileService.write(fileName, timelockTransactions);
};

export default func;
func.tags = ["TimelockSetMaxReinvestBountyBpsWorkers02"];
