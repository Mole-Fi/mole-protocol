/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-04-18 14:01:08
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-19 20:38:46
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, upgrades } from "hardhat";
import { DeltaNeutralVault, DeltaNeutralVault__factory, WNativeRelayer__factory } from "../../../../typechain";
import { ConfigEntity } from "../../../entities";

interface IDeltaNeutralVaultInput {
  name: string;
  symbol: string;
  stableVaultSymbol: string;
  assetVaultSymbol: string;
  stableSymbol: string;
  assetSymbol: string;
  stableDeltaWorker: string;
  assetDeltaWorker: string;
  lpAddress: string;
  deltaNeutralVaultConfig: string;
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

  const deltaVaultInputs: IDeltaNeutralVaultInput[] = [
    {
      name: "Hedge Fund 3x ETH-USDC TDJ1",
      symbol: "f3x-ETHUSDC-TDJ1",
      stableVaultSymbol: "mUSDC",
      assetVaultSymbol: "mETH",
      stableSymbol: "USDC",
      assetSymbol: "ETH",
      lpAddress: "0x83FE3893033d601Cc2142221c5739B52379bc4E3",
      deltaNeutralVaultConfig: "0x96b16cFFb3797e861666F48e8dE621f7BE318A87",
      stableDeltaWorker: "0x660fBc37439f64DE7114c07fdAFA19d995ee2086",
      assetDeltaWorker: "0xa1233717196bFAEadc7530F1edf05a8E504157Fb",
    },
  ];

  const config = ConfigEntity.getConfig();
  const deployer = (await ethers.getSigners())[0];
  const moleTokenAddress = config.Tokens.MOLE;
  const wNativeRelayerAddr = config.SharedConfig.WNativeRelayer;
  for (let i = 0; i < deltaVaultInputs.length; i++) {
    const stableVault = config.Vaults.find((v) => v.symbol === deltaVaultInputs[i].stableVaultSymbol);
    const assetVault = config.Vaults.find((v) => v.symbol === deltaVaultInputs[i].assetVaultSymbol);
    if (stableVault === undefined) {
      throw `error: unable to find vault from ${deltaVaultInputs[i].stableVaultSymbol}`;
    }
    if (assetVault === undefined) {
      throw `error: unable to find vault from ${deltaVaultInputs[i].assetVaultSymbol}`;
    }

    const DeltaNeutralVault = (await ethers.getContractFactory(
      "DeltaNeutralVault",
      deployer
    )) as DeltaNeutralVault__factory;

    console.log("===================================================================================");
    console.log(`>> Deploying a DeltaNeutralVault ${deltaVaultInputs[i].name}`);
    const deltaNeutralVault = (await upgrades.deployProxy(DeltaNeutralVault, [
      deltaVaultInputs[i].name,
      deltaVaultInputs[i].symbol,
      stableVault.address,
      assetVault.address,
      deltaVaultInputs[i].stableDeltaWorker,
      deltaVaultInputs[i].assetDeltaWorker,
      deltaVaultInputs[i].lpAddress,
      moleTokenAddress,
      config.Oracle.DeltaNeutralOracle!,
      deltaVaultInputs[i].deltaNeutralVaultConfig,
    ])) as DeltaNeutralVault;
    const deployTxReceipt = await deltaNeutralVault.deployTransaction.wait(3);
    console.log(`>> Deployed at ${deltaNeutralVault.address}`);
    console.log(`>> Deployed block: ${deployTxReceipt.blockNumber}`);
    console.log("✅ Done");

    if (deltaVaultInputs[i].assetVaultSymbol === "ibWBNB" 
    || deltaVaultInputs[i].assetVaultSymbol === "ibFTM"
    || deltaVaultInputs[i].assetVaultSymbol === 'mAVAX') {
      console.log(`>> Set Caller ok for deltaNeutralVault if have native asset`);
      const wNativeRelayer = WNativeRelayer__factory.connect(wNativeRelayerAddr, deployer);
      await (await wNativeRelayer.setCallerOk([deltaNeutralVault.address], true)).wait(3);
      console.log("✅ Done");
    }
  }
};

export default func;
func.tags = ["DeltaNeutralVault"];
