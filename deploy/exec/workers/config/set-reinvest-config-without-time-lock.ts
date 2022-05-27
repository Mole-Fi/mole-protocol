import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, network } from "hardhat";
import { IWorker03__factory, Timelock__factory, TraderJoeV2Worker03__factory } from "../../../../typechain";
import { ConfigEntity, TimelockEntity } from "../../../entities";

interface IWorker {
  WORKER_NAME: string;
  ADDRESS: string;
}

type IWorkers = Array<IWorker>;

interface IWorkerReinvestConfig {
  WORKER_NAME: string;
  ADDRESS: string;
  REINVEST_BOUNTY_BPS: string;
  REINVEST_THRESHOLD: string;
  REINVEST_PATH: Array<string>;
}

type IWorkerReinvestConfigs = Array<IWorkerReinvestConfig>;

interface IWorkerReinvestConfigInput {
  WORKER_NAME: string;
  REINVEST_BOUNTY_BPS: string;
  REINVEST_THRESHOLD: string;
  REINVEST_PATH?: Array<string>;
}

type IWorkerReinvestConfigInputs = Array<IWorkerReinvestConfigInput>;

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
  const workerInputs: IWorkerReinvestConfigInputs = [
    {
      WORKER_NAME: "USDt-USDT.e TraderJoeWorker",
      REINVEST_BOUNTY_BPS: "900",
      REINVEST_THRESHOLD: "100",
      REINVEST_PATH: ["JOE", "USDt"],
    },
    {
      WORKER_NAME: "USDC-USDC.e TraderJoeWorker",
      REINVEST_BOUNTY_BPS: "900",
      REINVEST_THRESHOLD: "100",
      REINVEST_PATH: ["JOE", "USDC"],
    },
    {
      WORKER_NAME: "USDC-ETH 3x DeltaNeutralTraderJoeWorker",
      REINVEST_BOUNTY_BPS: "1500",
      REINVEST_THRESHOLD: "100",
      REINVEST_PATH: ["JOE", "USDC"],
    },
    {
      WORKER_NAME: "ETH-USDC.e TraderJoeWorker",
      REINVEST_BOUNTY_BPS: "900",
      REINVEST_THRESHOLD: "100",
      REINVEST_PATH: ["JOE", "ETH"],
    },
    {
      WORKER_NAME: "ETH-USDC 3x DeltaNeutralTraderJoeWorker",
      REINVEST_BOUNTY_BPS: "1500",
      REINVEST_THRESHOLD: "100",
      REINVEST_PATH: ["JOE", "ETH"],
    },
    {
      WORKER_NAME: "ETH.e-USDC.e TraderJoeWorker",
      REINVEST_BOUNTY_BPS: "900",
      REINVEST_THRESHOLD: "100",
      REINVEST_PATH: ["JOE", "ETH.e"],
    },
  ]

  const config = ConfigEntity.getConfig();
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
  const reinvestConfigs: IWorkerReinvestConfigs = workerInputs.map((reinvestConfig) => {
    // 1. find each worker having an identical name as workerInput
    // 2. if hit return
    // 3. other wise throw error
    const hit = allWorkers.find((worker) => {
      return worker.WORKER_NAME === reinvestConfig.WORKER_NAME;
    });
    if (hit === undefined) throw new Error(`could not find ${reinvestConfig.WORKER_NAME}`);

    if (!reinvestConfig.WORKER_NAME.includes("CakeMaxiWorker") && !reinvestConfig.REINVEST_PATH)
      throw new Error(`${reinvestConfig.WORKER_NAME} must have a REINVEST_PATH`);

    const tokenList: any = config.Tokens;
    let reinvestPath: Array<string> = [];
    if (reinvestConfig.REINVEST_PATH) {
      reinvestPath = reinvestConfig.REINVEST_PATH.map((p) => {
        const addr = tokenList[p];
        if (addr === undefined) {
          throw `error: path: unable to find address of ${p}`;
        }
        return addr;
      });
    }

    return {
      WORKER_NAME: hit.WORKER_NAME,
      ADDRESS: hit.ADDRESS,
      REINVEST_BOUNTY_BPS: reinvestConfig.REINVEST_BOUNTY_BPS,
      REINVEST_THRESHOLD: ethers.utils.parseEther(reinvestConfig.REINVEST_THRESHOLD).toString(),
      REINVEST_PATH: reinvestPath,
    };
  });

  const deployer = (await ethers.getSigners())[0];
  const timelockTransactions: Array<TimelockEntity.Transaction> = [];
  let nonce = await deployer.getTransactionCount();

  for (const reinvestConfig of reinvestConfigs) {
    const worker = TraderJoeV2Worker03__factory.connect(reinvestConfig.ADDRESS,deployer)
    let tx = await worker.setReinvestConfig(
      reinvestConfig.REINVEST_BOUNTY_BPS,
      reinvestConfig.REINVEST_THRESHOLD,
      reinvestConfig.REINVEST_PATH)
    await tx.wait()
  }
  
};

export default func;
func.tags = ["SetReinvestConfigWorkers02"];
