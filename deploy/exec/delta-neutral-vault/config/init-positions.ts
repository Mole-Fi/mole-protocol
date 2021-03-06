import { formatEther } from "ethers/lib/utils";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { DeltaNeutralVault__factory, DeltaNeutralOracle__factory, ERC20__factory } from "../../../../typechain";
import { ConfigEntity } from "../../../entities";
import { BigNumber } from "ethers";

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

  interface IInitPositionInputs {
    symbol: string;
    stableVaultSymbol: string;
    assetVaultSymbol: string;
    stableSymbol: string;
    assetSymbol: string;
    stableAmount: string;
    stableDecimal: number;
    assetDecimal: number;
    leverage: number;
  }
  interface IDepositWorkByte {
    posId: number;
    vaultAddress: string;
    workerAddress: string;
    twoSidesStrat: string;
    principalAmount: BigNumber;
    borrowAmount: BigNumber;
    maxReturn: BigNumber;
    farmingTokenAmount: BigNumber;
    minLpReceive: BigNumber;
  }

  function buildDepositWorkByte(input: IDepositWorkByte): string {
    const workByte = ethers.utils.defaultAbiCoder.encode(
      ["address", "uint256", "address", "uint256", "uint256", "uint256", "bytes"],
      [
        input.vaultAddress,
        input.posId,
        input.workerAddress,
        input.principalAmount,
        input.borrowAmount,
        input.maxReturn,
        ethers.utils.defaultAbiCoder.encode(
          ["address", "bytes"],
          [
            input.twoSidesStrat,
            ethers.utils.defaultAbiCoder.encode(["uint256", "uint256"], [input.farmingTokenAmount, input.minLpReceive]),
          ]
        ),
      ]
    );
    return workByte;
  }

  const initPositionInputs: IInitPositionInputs[] = [
    {
      symbol: "f3x-ETHUSDC-TDJ1",
      stableVaultSymbol: "mUSDC",
      assetVaultSymbol: "mETH",
      stableSymbol: "USDC",
      assetSymbol: "ETH",
      stableAmount: "3000",
      stableDecimal: 6,
      assetDecimal: 18,
      leverage: 3,
    },
  ];
  const config = ConfigEntity.getConfig();
  const deployer = (await ethers.getSigners())[0];
  const tokenLists: any = config.Tokens;
  let nonce = await deployer.getTransactionCount();
  let stableTwoSidesStrat: string;
  let assetTwoSidesStrat: string;

  for (let i = 0; i < initPositionInputs.length; i++) {
    const initPosition = initPositionInputs[i];
    console.log("===================================================================================");
    console.log(`>> Initializing position at ${initPosition.symbol}`);
    const deltaNeutralVaultInfo = config.DeltaNeutralVaults!.find((v) => v.symbol === initPosition.symbol);
    const stableVault = config.Vaults.find((v) => v.symbol === initPosition.stableVaultSymbol);
    const assetVault = config.Vaults.find((v) => v.symbol === initPosition.assetVaultSymbol);
    if (!deltaNeutralVaultInfo) {
      throw new Error(`error: unable to find delta neutral vault info for ${initPosition.symbol}`);
    }
    if (!stableVault) {
      throw new Error(`error: unable to find vault from ${initPosition.stableVaultSymbol}`);
    }
    if (!assetVault) {
      throw new Error(`error: unable to find vault from ${initPosition.assetVaultSymbol}`);
    }
    if (initPosition.stableDecimal > 18) {
      throw new Error(`error:not supported stableTokenDecimal > 18, value  ${initPosition.stableDecimal}`);
    }
    if (initPosition.assetDecimal > 18) {
      throw new Error(`error:not supported assetDecimal > 18, value  ${initPosition.assetDecimal}`);
    }

    if (initPosition.symbol.includes("TDJ")){
      stableTwoSidesStrat = stableVault.StrategyAddTwoSidesOptimal.TraderJoe!;
      assetTwoSidesStrat = assetVault.StrategyAddTwoSidesOptimal.TraderJoe!;
    }
    else {
      throw new Error(`err: no symbol is not match any strategy, value ${initPosition.symbol}`);
    }

    const stableToken = tokenLists[initPosition.stableSymbol];
    const assetToken = tokenLists[initPosition.assetSymbol];
    const stableTokenAsDeployer = ERC20__factory.connect(stableToken, deployer);
    const assetTokenAsDeployer = ERC20__factory.connect(assetToken, deployer);

    console.log(">> Check allowance");
    const stableTokenAllowance = await stableTokenAsDeployer.allowance(deployer.address, deltaNeutralVaultInfo.address);
    const assetTokenAllowance = await assetTokenAsDeployer.allowance(deployer.address, deltaNeutralVaultInfo.address);
    if (stableTokenAllowance.eq(0) || assetTokenAllowance.eq(0)) {
      console.log(">> Approve vault to spend stable tokens");
      await stableTokenAsDeployer.approve(deltaNeutralVaultInfo.address, ethers.constants.MaxUint256, {
        nonce: nonce++,
      });
    }
    if (assetTokenAllowance.eq(0)) {
      console.log(">> Approve vault to spend asset tokens");
      await assetTokenAsDeployer.approve(deltaNeutralVaultInfo.address, ethers.constants.MaxUint256, {
        nonce: nonce++,
      });
    }
    console.log(">> Allowance ok");

    const deltaNeutralOracle = DeltaNeutralOracle__factory.connect(config.Oracle.DeltaNeutralOracle!, deployer);
    const [stablePrice] = await deltaNeutralOracle.getTokenPrice(stableToken);
    const [assetPrice] = await deltaNeutralOracle.getTokenPrice(assetToken);

    console.log(`stablePrice: ${stablePrice}`);
    console.log(`assetPrice: ${assetPrice}`);

    // open position1
    console.log(">> Preparing input for position 1 (StableVaults)");

    const stableAmount = ethers.utils.parseUnits(initPosition.stableAmount, initPosition.stableDecimal);
    console.log(`>> Stable amount: ${stableAmount}`);

    const assetAmount = ethers.utils.parseUnits("0", initPosition.assetDecimal);
    console.log(`>> assetAmount: ${assetAmount}`);

    const leverage = BigNumber.from(initPosition.leverage);

    // (lev -2) / (2lev - 2) for long equity amount
    const numeratorLongPosition = leverage.sub(2);
    const denumeratorLongPosition = leverage.mul(2).sub(2);
    const principalStablePosition = stableAmount.mul(numeratorLongPosition).div(denumeratorLongPosition);
    console.log(`>> principalStablePosition: ${principalStablePosition}`);

    const farmingTokenStablePosition = ethers.utils.parseEther("0");
    console.log(`>> farmingTokenStablePosition: ${farmingTokenStablePosition}`);

    const borrowMultiplierPosition = leverage.sub(1);
    const borrowAmountStablePosition = principalStablePosition.mul(borrowMultiplierPosition);
    console.log(`>> borrowAmountStablePosition: ${borrowAmountStablePosition}`);

    //open position 2
    console.log(">> Preparing input for position 2 (AssetVaults)");
    const principalAssetPosition = ethers.utils.parseEther("0");
    console.log(`>> principalAssetPosition: ${principalAssetPosition}`);

    // (lev) / (2lev - 2) for short equity amount
    const numeratorShortPosition = leverage;
    const denumeratorShortPosition = leverage.mul(2).sub(2);
    const farmingTokenAssetPosition = stableAmount.mul(numeratorShortPosition).div(denumeratorShortPosition);
    console.log(`>> farmingTokenAssetPosition: ${farmingTokenAssetPosition}`);

    //(farmingTokenAssetPosition / assetPrice) * (lev-1)
    const assetTokenConversionFactor = initPosition.assetDecimal - initPosition.stableDecimal;
    const borrowAmountAssetPosition = farmingTokenAssetPosition
      .mul(ethers.constants.WeiPerEther)
      .mul(borrowMultiplierPosition)
      .mul(10 ** assetTokenConversionFactor)
      .div(assetPrice);

    console.log(`>> borrowAmountAssetPosition: ${borrowAmountAssetPosition}`);

    const stableWorkbyteInput: IDepositWorkByte = {
      posId: 0,
      vaultAddress: stableVault.address,
      workerAddress: deltaNeutralVaultInfo.stableDeltaWorker,
      twoSidesStrat: stableTwoSidesStrat,
      principalAmount: principalStablePosition,
      borrowAmount: borrowAmountStablePosition,
      farmingTokenAmount: farmingTokenStablePosition,
      maxReturn: BigNumber.from(0),
      minLpReceive: BigNumber.from(0),
    };

    const assetWorkbyteInput: IDepositWorkByte = {
      posId: 0,
      vaultAddress: assetVault.address,
      workerAddress: deltaNeutralVaultInfo.assetDeltaWorker,
      twoSidesStrat: assetTwoSidesStrat,
      principalAmount: principalAssetPosition,
      borrowAmount: borrowAmountAssetPosition,
      farmingTokenAmount: farmingTokenAssetPosition,
      maxReturn: BigNumber.from(0),
      minLpReceive: BigNumber.from(0),
    };

    const stableWorkByte = buildDepositWorkByte(stableWorkbyteInput);
    const assetWorkByte = buildDepositWorkByte(assetWorkbyteInput);

    const data = ethers.utils.defaultAbiCoder.encode(
      ["uint8[]", "uint256[]", "bytes[]"],
      [
        [1, 1],
        [0, 0],
        [stableWorkByte, assetWorkByte],
      ]
    );

    const deltaNeutralVault = DeltaNeutralVault__factory.connect(deltaNeutralVaultInfo.address, deployer);

    console.log(">> Calling openPosition");
    const minSharesReceive = ethers.utils.parseEther("0");
    const initTx = await (
      await deltaNeutralVault.initPositions(stableAmount, assetAmount, minSharesReceive, data, {
        value: assetAmount,
        nonce: nonce++,
        gasLimit: 4e6
      })
    ).wait(3);
    console.log(">> initTx: ", initTx.transactionHash);
    console.log("✅ Done");

    const stablePosId = await deltaNeutralVault.stableVaultPosId();
    const assetPostId = await deltaNeutralVault.assetVaultPosId();

    console.log(`>> Stable Vault Position ID: ${stablePosId}`);
    console.log(`>> Asset Vault Position ID: ${assetPostId}`);
    console.log("✅ Done");
  }
};

export default func;
func.tags = ["DeltaNeutralVaultInitPositions"];
