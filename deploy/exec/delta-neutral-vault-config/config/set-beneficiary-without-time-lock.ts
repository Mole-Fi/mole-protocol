/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-05-09 16:13:41
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-09 16:36:43
 */

import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeltaNeutralVaultConfig__factory } from "../../../../typechain";
import { ConfigEntity } from "../../../entities";



interface IDeltaNeutralVaultConfig {
    CONFIG_ADDRESS: string;
    BENEFICIARY: string;
    BENEFICIARY_FEE_BPS: string;
}

type IDeltaNeutralVaultConfigs = Array<IDeltaNeutralVaultConfig>;

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

    const admin = (await ethers.getSigners())[0]

    const configInputs: IDeltaNeutralVaultConfigs = [
        {
            CONFIG_ADDRESS: '0x2ac71E0eC35C790BE7bf53Edab94af9932fD0149',
            BENEFICIARY: '0x6d8f43E5e9692B61A58dD0d247CBB449fB8A11f9',
            BENEFICIARY_FEE_BPS: '5333'
        }
    ]

    for (let i = 0; i < configInputs.length; i++) {
        const configInput = configInputs[i];
        console.log('>> Setting config')

        
        const dnVaultConfig = DeltaNeutralVaultConfig__factory.connect(configInput.CONFIG_ADDRESS,admin)

        let tx = await dnVaultConfig.setMoleBeneficiaryConfig(
            configInput.BENEFICIARY,
            configInput.BENEFICIARY_FEE_BPS
        )

        await tx.wait(3)

        console.log(`>> Setting dnVault config ${configInput.CONFIG_ADDRESS} success`)
    }

    console.log('>> Finished')
};

export default func;
func.tags = ["DeltaNeutralVaultConfigBeneficiaryWithoutTimelock"];


