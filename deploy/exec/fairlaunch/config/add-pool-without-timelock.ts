/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-03-16 20:44:13
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-24 10:52:05
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, network } from "hardhat";

import { FairLaunch__factory, Timelock__factory } from "../../../../typechain";
import { ConfigEntity } from "../../../entities";

interface IAddPool {
    STAKING_TOKEN_ADDRESS: string;
    ALLOC_POINT: number;
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
    const POOLS: Array<IAddPool> = [
        {
            STAKING_TOKEN_ADDRESS: "",
            ALLOC_POINT: 0,
        },
    ];

    const config = ConfigEntity.getConfig()
    const admin = (await ethers.getSigners())[0]

    const fairLaunch = FairLaunch__factory.connect(config.FairLaunch!.address!, admin)

    for (let i = 0; i < POOLS.length; i++) {
        const pool = POOLS[i];
        console.log(`>> Add ${pool.STAKING_TOKEN_ADDRESS} with ${pool.ALLOC_POINT}`);
        const tx = await fairLaunch.addPool(
            pool.ALLOC_POINT,
            pool.STAKING_TOKEN_ADDRESS,
            true
        );

        await tx.wait()
        console.log("✅ Done");
    }

};

export default func;
func.tags = ["AddPoolWithoutTimelock"];
