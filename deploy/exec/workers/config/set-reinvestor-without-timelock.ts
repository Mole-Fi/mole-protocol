/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-05-19 16:51:07
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-24 14:13:15
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, network } from "hardhat";
import { IWorker03__factory, Timelock__factory, TraderJoeV2Worker03__factory } from "../../../../typechain";
import { ConfigEntity, TimelockEntity, WorkerEntity } from "../../../entities";


interface IWorkerInput{
  WORKER_NAME:string;
  REINVESTORS:string[];
  IS_OK:boolean;
}

interface IWorkerConfig{
  WORKER_NAME:string;
  WORKER_ADDR:string;
  REINVESTORS:string[];
  IS_OK:boolean;  
}


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
  const title = "mainnet-xMOLE-set-reinvest-config";
  const workerInputs = [
    {
      WORKER_NAME: "USDt-USDT.e TraderJoeWorker",
      REINVESTORS: [
        "0x31b89Ac6C11892Bb017594dAe656c43e70343135"
      ],
      IS_OK: true
    },
    {
      WORKER_NAME: "USDC-USDC.e TraderJoeWorker",
      REINVESTORS: [
        "0x31b89Ac6C11892Bb017594dAe656c43e70343135"
      ],
      IS_OK: true
    },
    {
      WORKER_NAME: "USDC-ETH TraderJoeWorker",
      REINVESTORS: [
        "0x31b89Ac6C11892Bb017594dAe656c43e70343135"
      ],
      IS_OK: true
    },
    {
      WORKER_NAME: "USDC-ETH 3x DeltaNeutralTraderJoeWorker",
      REINVESTORS: [
        "0x31b89Ac6C11892Bb017594dAe656c43e70343135"
      ],
      IS_OK: true
    },
    {
      WORKER_NAME: "ETH-USDC.e TraderJoeWorker",
      REINVESTORS: [
        "0x31b89Ac6C11892Bb017594dAe656c43e70343135"
      ],
      IS_OK: true
    },
    {
      WORKER_NAME: "ETH-USDC 3x DeltaNeutralTraderJoeWorker",
      REINVESTORS: [
        "0x31b89Ac6C11892Bb017594dAe656c43e70343135"
      ],
      IS_OK: true
    },
    {
      WORKER_NAME: "ETH.e-USDC.e TraderJoeWorker",
      REINVESTORS: [
        "0x31b89Ac6C11892Bb017594dAe656c43e70343135"
      ],
      IS_OK: true
    }

  ];

  const config = ConfigEntity.getConfig()
  const admin = (await ethers.getSigners())[0]
    
  const workerConfigs:IWorkerConfig[] = workerInputs.map(v => {

    for (const vault of config.Vaults) {
      for (const worker of vault.workers) {
        if(worker.name === v.WORKER_NAME){
          return {
            WORKER_NAME : v.WORKER_NAME,
            WORKER_ADDR : worker.address,
            REINVESTORS: v.REINVESTORS,
            IS_OK : v.IS_OK
          }
        }
      }
    }

    throw `Not found.`
  })

  for (const workerConfig of workerConfigs) {
    const worker = IWorker03__factory.connect(workerConfig.WORKER_ADDR, admin)
    await ( 
      await worker.setReinvestorOk(workerConfig.REINVESTORS,workerConfig.IS_OK)
    ).wait()
  }

};

export default func;
func.tags = ["SetReinvestConfigWorkersWithoutTimelock"];
