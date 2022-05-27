/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-05-24 11:29:28
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-24 15:17:10
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { TimelockEntity } from "../../../entities";
import { mapWorkers } from "../../../entities/worker";
import { FileService, TimelockService } from "../../../services";
import { ethers } from "hardhat";
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
  const fileName = "mainnet-xMOLE-set-treasury-config-pcs";
  const workerInputs: Array<string> = [
    "USDT-BTCB Worker",
  ];
  const TREASURY_ACCOUNT = "0xe45216Ac4816A5Ec5378B1D13dE8aA9F262ce9De";
  const TREASURY_BOUNTY_BPS = "900";
  const EXACT_ETA = "1640242800";

  const targetedWorkers = mapWorkers(workerInputs);
  const deployer = (await ethers.getSigners())[0];
  const timelockTransactions: Array<TimelockEntity.Transaction> = [];
  let nonce = await deployer.getTransactionCount();

  for (const targetedWorker of targetedWorkers) {
    timelockTransactions.push(
      await TimelockService.queueTransaction(
        `set treasury config for ${targetedWorker.name}`,
        targetedWorker.address,
        "0",
        "setTreasuryConfig(address,uint256)",
        ["address", "uint256"],
        [TREASURY_ACCOUNT, TREASURY_BOUNTY_BPS],
        EXACT_ETA,
        { nonce: nonce++ }
      )
    );
  }

  FileService.write(fileName, timelockTransactions);
};

export default func;
func.tags = ["TimelockAddTreasuryFieldsWorkers02"];
