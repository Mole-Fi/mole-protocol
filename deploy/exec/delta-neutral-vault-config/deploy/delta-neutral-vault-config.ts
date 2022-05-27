import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, upgrades } from "hardhat";
import { DeltaNeutralVaultConfig, DeltaNeutralVaultConfig__factory } from "../../../../typechain";
import { ConfigEntity } from "../../../entities";

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
  const config = ConfigEntity.getConfig();

  const REBALANCE_FACTOR = "6800";
  const POSITION_VALUE_TOLERANCE_BPS = "100";
  const DEBT_RATIO_TOLERANCE_BPS = "30";
  const MOLE_REINVEST_FEE_TREASURY = process.env.MOLE_BONUS_ADDRESS!;
  const MOLE_BOUNTY_BPS = "1500";
  const LEVERAGE_LEVEL = 3;
  const WHITELIST_REBALANCE = [process.env.MOLE_DELTA_NEUTRAL_DEFAULT_OPERATOR_ADDRESS!];
  const WHITELIST_REINVEST = [process.env.MOLE_DELTA_NEUTRAL_DEFAULT_OPERATOR_ADDRESS!];
  const REINVEST_PATH = ["MOLE", "USDC"];
  const SWAP_ROUTER_ADDR = config.Exchanges.TraderJoe?.JoeRouter!;
  const VALUE_LIMIT = "20000000";
  const DEPOSIT_FEE_TREASURY = process.env.MOLE_BONUS_ADDRESS!;
  const DEPOSIT_FEE_BPS = "0";
  const WITHDRAWAL_FEE_TREASURY = process.env.MOLE_BONUS_ADDRESS!;
  const WITHDRAWAL_FEE_BPS = "20";
  const MANAGEMENT_TREASURY = process.env.MOLE_BONUS_ADDRESS!;
  const MANAGEMENT_FEE_PER_SEC = "634195840";
  const MOLE_BENEFICIARY = process.env.MOLE_BONUS_ADDRESS!;
  //  const MOLE_BENEFICIARY_FEE_BPS = "5333";
  const MOLE_BENEFICIARY_FEE_BPS = "0";
  const FAIR_LAUNCH_ADDR = config.FairLaunch!.address;
  const WRAP_NATIVE_ADDR = config.Tokens.WAVAX;

  const deployer = (await ethers.getSigners())[0];
  const WNATIVE_RELAYER = config.SharedConfig.WNativeRelayer;

  console.log(">> Deploying an upgradable DeltaNeutralVaultConfig contract");

  const moleTokenAddress = config.Tokens.MOLE;
  const tokenList: any = config.Tokens;
  const reinvestPath: Array<string> = REINVEST_PATH.map((p) => {
    const addr = tokenList[p];
    if (addr === undefined) {
      throw `error: path: unable to find address of ${p}`;
    }
    return addr;
  });

  const DeltaNeutralVaultConfig = (await ethers.getContractFactory(
    "DeltaNeutralVaultConfig",
    deployer
  )) as DeltaNeutralVaultConfig__factory;

  const deltaNeutralVaultConfig = (await upgrades.deployProxy(DeltaNeutralVaultConfig, [
    WRAP_NATIVE_ADDR,
    WNATIVE_RELAYER,
    FAIR_LAUNCH_ADDR,
    REBALANCE_FACTOR,
    POSITION_VALUE_TOLERANCE_BPS,
    DEBT_RATIO_TOLERANCE_BPS,
    DEPOSIT_FEE_TREASURY,
    MANAGEMENT_TREASURY,
    WITHDRAWAL_FEE_TREASURY,
    moleTokenAddress,
  ])) as DeltaNeutralVaultConfig;
  await deltaNeutralVaultConfig.deployTransaction.wait(3);

  console.log(`>> Deployed at ${deltaNeutralVaultConfig.address}`);
  console.log("✅ Done");

  let nonce = await deployer.getTransactionCount();

  console.log(`>> Setting Value limit`);
  const limitValue = ethers.utils.parseEther(VALUE_LIMIT);
  await deltaNeutralVaultConfig.setValueLimit(limitValue, { nonce: nonce++ });
  console.log("✅ Done");

  console.log(`>> Setting Leverage Level`);
  await deltaNeutralVaultConfig.setLeverageLevel(LEVERAGE_LEVEL, { nonce: nonce++ });
  console.log("✅ Done");

  console.log(`>> Setting Whitelist Rebalance`);
  await deltaNeutralVaultConfig.setWhitelistedRebalancer(WHITELIST_REBALANCE, true, { nonce: nonce++ });
  console.log("✅ Done");

  console.log(`>> Setting Whitelist Reinvest`);
  await deltaNeutralVaultConfig.setwhitelistedReinvestors(WHITELIST_REINVEST, true, { nonce: nonce++ });
  console.log("✅ Done");

  console.log(`>> Setting Reinvest Path`);
  await deltaNeutralVaultConfig.setReinvestPath(reinvestPath, { nonce: nonce++, gasLimit: 1000000 });
  console.log("✅ Done");

  console.log(`>> Setting Swap Router`);
  await deltaNeutralVaultConfig.setSwapRouter(SWAP_ROUTER_ADDR, { nonce: nonce++ });
  console.log("✅ Done");

  console.log(`>> Setting Fees`);
  await deltaNeutralVaultConfig.setFees(
    DEPOSIT_FEE_TREASURY,
    DEPOSIT_FEE_BPS,
    WITHDRAWAL_FEE_TREASURY,
    WITHDRAWAL_FEE_BPS,
    MANAGEMENT_TREASURY,
    MANAGEMENT_FEE_PER_SEC,
    { nonce: nonce++ }
  );
  console.log("✅ Done");

  console.log(">> Setting MOLE bounty");
  await deltaNeutralVaultConfig.setMoleBountyConfig(MOLE_REINVEST_FEE_TREASURY, MOLE_BOUNTY_BPS, {
    nonce: nonce++,
  });
  console.log("✅ Done");

  console.log(">> Setting MOLE beneficiacy");
  await deltaNeutralVaultConfig.setMoleBeneficiaryConfig(MOLE_BENEFICIARY, MOLE_BENEFICIARY_FEE_BPS, {
    nonce: nonce++,
  });
};

export default func;
func.tags = ["DeltaNeutralVaultConfig"];
