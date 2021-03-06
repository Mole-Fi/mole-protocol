/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-04-18 14:01:08
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-24 15:26:16
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { DeltaNeutralTraderJoeV2Worker03__factory } from "../../../../typechain";
import { getConfig } from "../../../entities/config";
import { ethers } from "hardhat";

interface IWorkerInput {
  name: string;
}

interface IWorkerInfo {
  name: string;
  address: string;
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
  const config = getConfig();
  const DELTA_NEUTRAL_VAULT = "Hedge Fund 3x ETH-USDC TDJ1";
  const workerInputs: IWorkerInput[] = [
    {
      name: "ETH-USDC 3x DeltaNeutralTraderJoeWorker",
    },
    {
      name: "USDC-ETH 3x DeltaNeutralTraderJoeWorker",
    },
  ];

  const deployer = (await ethers.getSigners())[0];
  let nonce = await deployer.getTransactionCount();

  const allWorkers: Array<IWorkerInfo> = config.Vaults.reduce((accum, vault) => {
    return accum.concat(
      vault.workers.map((worker) => {
        return {
          name: worker.name,
          address: worker.address,
        };
      })
    );
  }, [] as Array<IWorkerInfo>);
  const workerInfos: Array<IWorkerInfo> = workerInputs.map((workerInput) => {
    const hit = allWorkers.find((worker) => {
      return worker.name === workerInput.name;
    });

    if (!!hit) return hit;

    throw new Error(`could not find ${workerInput.name}`);
  });
  const deltaNeutralVault = config.DeltaNeutralVaults!.find((deltaVault) => deltaVault.name === DELTA_NEUTRAL_VAULT);
  if (!deltaNeutralVault) throw new Error(`could not find ${DELTA_NEUTRAL_VAULT}`);

  for (let i = 0; i < workerInfos.length; i++) {
    console.log("===================================================================================");
    console.log(`>> Setting up whitelist callers for ${workerInfos[i].name}`);
    const deltaWorker = DeltaNeutralTraderJoeV2Worker03__factory.connect(workerInfos[i].address, deployer);
    await deltaWorker.setWhitelistedCallers([deltaNeutralVault.address], true, { nonce: nonce++ });
    console.log("✅ Done");
  }
};

export default func;
func.tags = ["DeltaNeutralWorkerSetWhitelistCallers"];
