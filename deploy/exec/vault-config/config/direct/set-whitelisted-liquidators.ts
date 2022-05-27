/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-04-11 21:52:55
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-23 20:15:09
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { ConfigEntity } from "../../../../entities";
import { ConfigurableInterestVaultConfig__factory } from "../../../../../typechain";

interface IInput {
  VAULT_SYMBOL: string;
  WHITELISTED_LIQUIDATORS: string[];
  IS_ENABLE: boolean;
}

interface IDerivedInput {
  configAddress: string;
  whitelistedLiquidators: string[];
  isEnable: boolean;
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
  // const TITLE = "roberto";


  const deployer = (await ethers.getSigners())[0];
  const liquidator = deployer.address


  const TARGETED_VAULT_CONFIG: Array<IInput> = [
    {
      VAULT_SYMBOL: "mUSDt",
      WHITELISTED_LIQUIDATORS: [liquidator],
      IS_ENABLE: true,
    },
    {
      VAULT_SYMBOL: "mUSDC",
      WHITELISTED_LIQUIDATORS: [liquidator],
      IS_ENABLE: true,
    },
    {
      VAULT_SYMBOL: "mETH",
      WHITELISTED_LIQUIDATORS: [liquidator],
      IS_ENABLE: true,
    },
    {
      VAULT_SYMBOL: "mETH.e",
      WHITELISTED_LIQUIDATORS: [liquidator],
      IS_ENABLE: true,
    }
  ];
  const EXACT_ETA = "1638935400";

  const config = ConfigEntity.getConfig()
  

  const inputs: Array<IDerivedInput> = TARGETED_VAULT_CONFIG.map((tv) => {
    const vault = config.Vaults.find((v) => tv.VAULT_SYMBOL == v.symbol);
    if (vault === undefined) {
      throw `error: not found vault with ${tv} symbol`;
    }
    if (vault.config === "") {
      throw `error: not found config address`;
    }

    return {
      configAddress: vault.config,
      whitelistedLiquidators: tv.WHITELISTED_LIQUIDATORS,
      isEnable: tv.IS_ENABLE,
    };
  });

  

  for (const i of inputs) {
    
    const vaultConfig = ConfigurableInterestVaultConfig__factory.connect(i.configAddress,deployer)
    let tx = await vaultConfig.setWhitelistedLiquidators(i.whitelistedLiquidators,i.isEnable)
    await tx.wait()
    console.log('>> setWhitelistedLiquidators OK : ',i)
  }

  // FileService.write(TITLE, timelockTransactions);
};

export default func;
func.tags = ["DirectSetWhitelistedLiquidators"];
