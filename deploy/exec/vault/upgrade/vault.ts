/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-03-16 20:44:13
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-24 15:26:45
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, upgrades, network } from "hardhat";
import { Timelock__factory, Vault__factory } from "../../../../typechain";
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
  const TARGETED_VAULTS = ["ibUSDC"];
  const EXACT_ETA = "1629957600";

  /*




  
  */

  const admin =  (await ethers.getSigners())[0]

  const config = ConfigEntity.getConfig()

  const timelock = Timelock__factory.connect(config.Timelock,admin);
  const toBeUpgradedVaults = TARGETED_VAULTS.map((tv) => {
    const vault = config.Vaults.find((v) => tv == v.symbol);
    if (vault === undefined) {
      throw `error: not found vault with ${tv} symbol`;
    }
    if (vault.config === "") {
      throw `error: not found config address`;
    }

    return vault;
  });

  for (const vault of toBeUpgradedVaults) {
    console.log(`============`);
    console.log(`>> Upgrading Vault at ${vault.symbol} through Timelock + ProxyAdmin`);
    console.log(">> Prepare upgrade & deploy if needed a new IMPL automatically.");
    const NewVaultFactory = (await ethers.getContractFactory("Vault")) as Vault__factory;
    const preparedNewVault = await upgrades.prepareUpgrade(vault.address, NewVaultFactory);
    console.log(`>> Implementation address: ${preparedNewVault}`);
    console.log("✅ Done");

    const currentVault = Vault__factory.connect(vault.address,admin)
    
    if((await currentVault.owner()).toLowerCase() === config.Timelock.toLowerCase()){
      console.log(`>> Queue tx on Timelock to upgrade the implementation`);
      await timelock.queueTransaction(
        config.ProxyAdmin,
        "0",
        "upgrade(address,address)",
        ethers.utils.defaultAbiCoder.encode(["address", "address"], [vault.address, preparedNewVault]),
        EXACT_ETA
      );
      console.log("✅ Done");
  
      console.log(`>> Generate executeTransaction:`);
      console.log(
        `await timelock.executeTransaction('${config.ProxyAdmin}', '0', 'upgrade(address,address)', ethers.utils.defaultAbiCoder.encode(['address','address'], ['${vault.address}','${preparedNewVault}']), ${EXACT_ETA})`
      );
      console.log("✅ Done");
    }else{
      console.log(`>> Upgrade the implementation`);
      // const proxyAdmin = AdminUpgradeabilityProxy__factory.connect(vault.address,admin)
      // let tx = await proxyAdmin.upgradeTo(preparedNewVault,{gasLimit:1e6})
      // await tx.wait(3)
      // console.log("✅ Done");

      await upgrades.upgradeProxy(vault.address,NewVaultFactory)
      
      console.log("✅ Done");

    }

  }
};

export default func;
func.tags = ["UpgradeVault"];
