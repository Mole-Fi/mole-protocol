/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-04-18 14:01:08
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-19 12:12:37
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, upgrades } from "hardhat";
import {
  DeltaNeutralVaultConfig__factory,
  DeltaNeutralVaultGateway,
  DeltaNeutralVaultGateway__factory,
} from "../../../../typechain";
import { getConfig } from "../../../entities/config";

interface IDeltaVaultInput {
  name: string;
}

interface IDeltaVaultInfo {
  name: string;
  address: string;
  deltaVaultConfig: string;
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
  const deltaVaultInputs: IDeltaVaultInput[] = [
    {
      name: "Hedge Fund 3x ETH-USDC TDJ1",
    },
  ];

  const config = getConfig();
  const deployer = (await ethers.getSigners())[0];

  const deltaVaultInfos: IDeltaVaultInfo[] = deltaVaultInputs.map((input) => {
    const deltaVaultInfo = config.DeltaNeutralVaults?.find((deltaVault) => input.name === deltaVault.name);

    if (!deltaVaultInfo) throw new Error(`DeltaNeutralVault ${input.name} not found in config`);

    return {
      name: deltaVaultInfo.name,
      address: deltaVaultInfo.address,
      deltaVaultConfig: deltaVaultInfo.config,
    };
  });

  for (let i = 0; i < deltaVaultInfos.length; i++) {
    console.log("===================================================================================");
    console.log(`>> Deploying a DeltaNeutralVaultGateway for ${deltaVaultInputs[i].name}`);
    const DeltaNeutralVaultGateway = (await ethers.getContractFactory(
      "DeltaNeutralVaultGateway",
      deployer
    )) as DeltaNeutralVaultGateway__factory;

    const deltaNeutralVaultGateway = (await upgrades.deployProxy(DeltaNeutralVaultGateway, [
      deltaVaultInfos[i].address,
    ])) as DeltaNeutralVaultGateway;
    const deployTxReceipt = await deltaNeutralVaultGateway.deployTransaction.wait(3);
    console.log(`>> Deployed at ${deltaNeutralVaultGateway.address}`);
    console.log(`>> Deployed block ${deployTxReceipt.blockNumber}`);
    console.log("✅ Done");

    console.log(`>> Setting DeltaNeutralConfig's WhitelistCallers for DeltaNeutralVaultGateway`);
    const deltaNeutralVaultConfig = DeltaNeutralVaultConfig__factory.connect(
      deltaVaultInfos[i].deltaVaultConfig,
      deployer
    );
    await deltaNeutralVaultConfig.setWhitelistedCallers([deltaNeutralVaultGateway.address], true);
    console.log("✅ Done");
  }
};

export default func;
func.tags = ["DeltaNeutralVaultGateway"];
