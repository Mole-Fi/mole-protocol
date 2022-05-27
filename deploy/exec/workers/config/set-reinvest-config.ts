import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, network } from "hardhat";
import { Timelock__factory } from "../../../../typechain";
import { FileService, TimelockService } from "../../../services";
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
      REINVEST_PATH: ["JOE", "BTCB"],
    }
  ];
  const EXACT_ETA = "1640242800";

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
    if (reinvestConfig.WORKER_NAME.includes("CakeMaxiWorker")) {
      timelockTransactions.push(
        await TimelockService.queueTransaction(
          `setting reinvest params for ${reinvestConfig.WORKER_NAME}`,
          reinvestConfig.ADDRESS,
          "0",
          "setReinvestConfig(uint256,uint256)",
          ["uint256", "uint256"],
          [reinvestConfig.REINVEST_BOUNTY_BPS, reinvestConfig.REINVEST_THRESHOLD],
          EXACT_ETA,
          { nonce: nonce++ }
        )
      );
    } else {
      timelockTransactions.push(
        await TimelockService.queueTransaction(
          `setting reinvest params for ${reinvestConfig.WORKER_NAME}`,
          reinvestConfig.ADDRESS,
          "0",
          "setReinvestConfig(uint256,uint256,address[])",
          ["uint256", "uint256", "address[]"],
          [reinvestConfig.REINVEST_BOUNTY_BPS, reinvestConfig.REINVEST_THRESHOLD, reinvestConfig.REINVEST_PATH],
          EXACT_ETA,
          { nonce: nonce++ }
        )
      );
    }
  }

  

  FileService.write(`${title}`, timelockTransactions);
};

export default func;
func.tags = ["TimelockSetReinvestConfigWorkers02"];
