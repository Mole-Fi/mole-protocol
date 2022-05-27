/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-05-24 11:29:28
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-24 14:12:11
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, upgrades, network } from "hardhat";
import { ConfigurableInterestVaultConfig__factory, Timelock__factory } from "../../../../typechain";
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
  const TARGETED_VAULT_CONFIG = ["ibWBNB", "ibBUSD", "ibETH", "ibMOLE", "ibUSDT", "ibBTCB", "ibTUSD"];
  const EXACT_ETA = "1629957600";

  /*




  
  */

  const config = ConfigEntity.getConfig()

  const timelock = Timelock__factory.connect(config.Timelock, (await ethers.getSigners())[0]);
  const toBeUpgradedVaults = TARGETED_VAULT_CONFIG.map((tv) => {
    const vault = config.Vaults.find((v) => tv == v.symbol);
    if (vault === undefined) {
      throw `error: not found vault with ${tv} symbol`;
    }
    if (vault.config === "") {
      throw `error: not found config address`;
    }

    return vault;
  });

  console.log(`>> Prepare upgrade vault config through Timelock + ProxyAdmin`);

  for (const toBeUpgradedVault of toBeUpgradedVaults) {
    console.log(">> Prepare upgrade a new IMPL. (It should return the same impl address)");
    const NewVaultConfig = (await ethers.getContractFactory(
      "ConfigurableInterestVaultConfig"
    )) as ConfigurableInterestVaultConfig__factory;
    const preparedNewVaultConfig = await upgrades.prepareUpgrade(toBeUpgradedVaults[0].config, NewVaultConfig, {
      unsafeAllowRenames: true,
    });
    console.log(`>> Implementation deployed at: ${preparedNewVaultConfig}`);
    console.log("✅ Done");

    console.log(`>> Queue tx on Timelock to upgrade the implementation of ${toBeUpgradedVault.symbol} VaultConfig`);
    await timelock.queueTransaction(
      config.ProxyAdmin,
      "0",
      "upgrade(address,address)",
      ethers.utils.defaultAbiCoder.encode(["address", "address"], [toBeUpgradedVault.config, preparedNewVaultConfig]),
      EXACT_ETA
    );
    console.log("✅ Done");

    console.log(`>> Generate executeTransaction:`);
    console.log(
      `await timelock.executeTransaction('${config.ProxyAdmin}', '0', 'upgrade(address,address)', ethers.utils.defaultAbiCoder.encode(['address','address'], ['${toBeUpgradedVault.config}','${preparedNewVaultConfig}']), ${EXACT_ETA})`
    );
    console.log("✅ Done");
  }
};

export default func;
func.tags = ["UpgradeVaultConfig"];
