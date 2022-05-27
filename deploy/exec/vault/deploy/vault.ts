import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import {
  DebtToken,
  DebtToken__factory,
  FairLaunch__factory,
  MockERC20__factory,
  Timelock,
  Timelock__factory,
  Vault,
  Vault__factory,
  WNativeRelayer,
  WNativeRelayer__factory,
} from "../../../../typechain";
import { ethers, upgrades } from "hardhat";
import { ConfigEntity } from "../../../entities";


function verify(name:string,symbol:string){
  if(!name || !name.startsWith('Magic'))
    throw `error: invalid name ${name}, must startWith Magic `
  if(!symbol || !symbol.startsWith('m'))
    throw `error: invalid symbol ${symbol}, must startWith m`
}

function getBaseTokenSymbol(symbol:string) : string{
  return symbol.replace('m','')
}

function getDebtTokenSymbol(symbol:string) :string{
  return `debtM${getBaseTokenSymbol(symbol)}`
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
  const [admin,] = await ethers.getSigners()

  const ALLOC_POINT_FOR_DEPOSIT = 10;
  const ALLOC_POINT_FOR_OPEN_POSITION = 10;
  
  const VAULT_NAME = "AVAX Vault";
  const NAME = "Magic WAVAX";
  const SYMBOL = "mWAVAX";
  const EXACT_ETA = "1641628800";

  verify(NAME,SYMBOL)

  const baseTokenSymbol = getBaseTokenSymbol(SYMBOL)
  const debtTokenSymbol = getDebtTokenSymbol(SYMBOL)

  const config = ConfigEntity.getConfig();
  const targetedVault = config.Vaults.find((v) => v.symbol === SYMBOL);
  if (targetedVault === undefined) {
    throw `error: not found any vault with ${SYMBOL} symbol`;
  }
  if (targetedVault.config === "") {
    throw `error: not config address`;
  }

  const tokenList: any = config.Tokens;
  const baseTokenAddr = tokenList[baseTokenSymbol];
  if (baseTokenAddr === undefined) {
    throw `error: not found ${baseTokenSymbol} in tokenList`;
  }

  const baseToken = MockERC20__factory.connect(baseTokenAddr, admin);
  const baseTokenDecimal = await baseToken.decimals();


  console.log(`>> Deploying ${debtTokenSymbol}`);
  const DebtToken = (await ethers.getContractFactory(
    "DebtToken",
    admin
  )) as DebtToken__factory;
  const debtToken = (await upgrades.deployProxy(DebtToken, [
    debtTokenSymbol,
    debtTokenSymbol,
    baseTokenDecimal,
    config.Timelock,
  ])) as DebtToken;
  await debtToken.deployed();
  const debtTokenDeployTx = await debtToken.deployTransaction.wait(3);
  console.log(`>> Deployed at ${debtToken.address}`);

  console.log(`>> Deploying an upgradable Vault contract for ${VAULT_NAME}`);
  const Vault = (await ethers.getContractFactory("Vault", (await ethers.getSigners())[0])) as Vault__factory;
  const vault = (await upgrades.deployProxy(Vault, [
    targetedVault.config,
    baseTokenAddr,
    NAME,
    SYMBOL,
    baseTokenDecimal,
    debtToken.address,
  ])) as Vault;
  
  await vault.deployed();
  const vaultDeployTx = await vault.deployTransaction.wait(3)
  console.log(`>> Deployed block: ${vaultDeployTx.blockNumber}`);
  console.log(`>> Deployed at ${vault.address}`);

  let nonce = await admin.getTransactionCount();

  console.log(">> Set okHolders on DebtToken to be be Vault");
  await debtToken.setOkHolders([vault.address, config.FairLaunch!.address], true, { nonce: nonce++ });
  console.log("✅ Done");

  console.log(">> Transferring ownership of debtToken to Vault");
  await debtToken.transferOwnership(vault.address, { nonce: nonce++ });
  console.log("✅ Done");

  const fairLaunch = FairLaunch__factory.connect(config.FairLaunch!.address,admin);
  const expectedDebtTokenPoolId = await fairLaunch.poolLength();

  if((await fairLaunch.owner()).toLowerCase() === config.Timelock.toLowerCase()){
    console.log("FairLaunch's owner is Timelock, handle it");
    const timelock = Timelock__factory.connect(config.Timelock, admin) as Timelock;

    console.log(">> Queue Transaction to add a debtToken pool through Timelock");
    await timelock.queueTransaction(
      config.Shield!,
      "0",
      "addPool(uint256,address,bool)",
      ethers.utils.defaultAbiCoder.encode(
        ["uint256", "address", "bool"],
        [ALLOC_POINT_FOR_OPEN_POSITION, debtToken.address, true]
      ),
      EXACT_ETA,
      { nonce: nonce++ }
    );
    console.log("✅ Done");

    console.log(">> Generate timelock executeTransaction");
    console.log(
      `await timelock.executeTransaction('${config.Shield}', '0', 'addPool(uint256,address,bool)', ethers.utils.defaultAbiCoder.encode(['uint256','address','bool'], [${ALLOC_POINT_FOR_OPEN_POSITION}, '${debtToken.address}', true]), ${EXACT_ETA})`
    );
    console.log("✅ Done");

    console.log(">> Sleep for 10000msec waiting for fairLaunch to update the pool");
    await new Promise((resolve) => setTimeout(resolve, 10000));
    console.log("✅ Done");

    console.log(">> link pool with vault");
    await vault.setFairLaunchPoolId(expectedDebtTokenPoolId, { gasLimit: "2000000", nonce: nonce++ });
    console.log("✅ Done");

    console.log(`>> Queue Transaction to add a ${SYMBOL} pool through Timelock`);
    await timelock.queueTransaction(
      config.Shield!,
      "0",
      "addPool(uint256,address,bool)",
      ethers.utils.defaultAbiCoder.encode(["uint256", "address", "bool"], [ALLOC_POINT_FOR_DEPOSIT, vault.address, true]),
      EXACT_ETA,
      { nonce: nonce++ }
    );
    console.log("✅ Done");

    console.log(">> Generate timelock executeTransaction");
    console.log(
      `await timelock.executeTransaction('${config.Shield}', '0', 'addPool(uint256,address,bool)', ethers.utils.defaultAbiCoder.encode(['uint256','address','bool'], [${ALLOC_POINT_FOR_DEPOSIT}, '${vault.address}', true]), ${EXACT_ETA})`
    );
    console.log("✅ Done");
  }else{
    console.log(">> FairLaunch's owner is NOT Timelock, add pool immediately");

    console.log(">> link pool with vault");
    await vault.setFairLaunchPoolId(expectedDebtTokenPoolId, { gasLimit: "2000000", nonce: nonce++ });
    console.log("✅ Done");

    console.log(`>> Add a ${debtTokenSymbol} to FairLaunch `);
    const addDebtTokenPoolTx = await fairLaunch.addPool(
      ALLOC_POINT_FOR_OPEN_POSITION,
      debtToken.address,
      true,
      { nonce: nonce++ }
    );
    await addDebtTokenPoolTx.wait(20);
    console.log("✅ Done");

    console.log(`>> Add a ${SYMBOL} to FairLaunch`);
    const addMPoolTx = await fairLaunch.addPool(
      ALLOC_POINT_FOR_DEPOSIT, 
      vault.address, 
      true, 
      {nonce: nonce++,}
    );
    await addMPoolTx.wait(3);
    console.log("✅ Done");
  }

  const wNativeRelayer = WNativeRelayer__factory.connect(
    config.SharedConfig.WNativeRelayer,
    (await ethers.getSigners())[0]
  ) as WNativeRelayer;

  console.log(">> Whitelisting Vault on WNativeRelayer Contract");
  await wNativeRelayer.setCallerOk([vault.address], true, { nonce: nonce++ });
  console.log("✅ Done");
};

export default func;
func.tags = ["Vault"];
