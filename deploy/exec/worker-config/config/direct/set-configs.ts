/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-04-11 21:50:13
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-23 21:28:05
 */
/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-04-08 14:45:16
 * @LastEditors: Hungry
 * @LastEditTime: 2022-04-11 20:43:41
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, network } from "hardhat";
import { ConfigEntity, TimelockEntity } from "../../../../entities";
import { WorkerConfig__factory } from "../../../../../typechain";


interface IWorker {
  WORKER_NAME: string;
  ADDRESS: string;
}

type IWorkers = Array<IWorker>;

interface IWorkerConfig{
  WORKER_NAME: string;
  WORKER_ADDRESS: string;
  WORK_FACTOR: string;
  KILL_FACTOR: string;
  MAX_PRICE_DIFF: string;
}


type IWorkerConfigs = Array<IWorkerConfig>;


/**
 * @description Deployment script for upgrades workers to 02 version
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
  const workerInputs : IWorkerConfigs = [
    {
      WORKER_NAME: "USDC-ETH TraderJoeWorker",
      WORKER_ADDRESS: "0x21A4Bf13cC7249e5445C9A927804C75cCc5ca09c",
      WORK_FACTOR: "5200",
      KILL_FACTOR: "7000",
      // WORK_FACTOR: "7000",
      // KILL_FACTOR: "8333",
      // WORK_FACTOR: "7800",
      // KILL_FACTOR: "9000",
      MAX_PRICE_DIFF: "11000"
    }
  ]

  const config = ConfigEntity.getConfig()
  const admin = (await ethers.getSigners())[0]

  const workerConfigAddr = config.SharedConfig.WorkerConfig

  if(!workerConfigAddr){
    throw `Missing WorkerConfig address.`
  }
  
  const workerConfig = WorkerConfig__factory.connect(workerConfigAddr,admin)

  for (let i = 0; i < workerInputs.length; i++) {
    const workerInput = workerInputs[i];
    
    console.log(">> Setting WorkerConfig");

    let tx = await workerConfig.setConfigs([workerInput.WORKER_ADDRESS],[
      {
        acceptDebt: true,
        workFactor: workerInput.WORK_FACTOR,
        killFactor: workerInput.KILL_FACTOR,
        maxPriceDiff: workerInput.MAX_PRICE_DIFF
      }
    ])

    await tx.wait(3)
  }


  console.log(">> Finished.")

};

export default func;
func.tags = ["SetConfigWorkers"];
