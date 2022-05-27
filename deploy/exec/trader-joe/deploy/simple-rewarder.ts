/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-05-16 20:44:18
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-19 11:39:59
 */

import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { IERC20__factory, MasterChefJoeV2__factory, MasterChefJoeV3__factory, SimpleRewarderPerSec__factory } from "../../../../typechain";
import { ConfigEntity } from "../../../entities";


interface IResetMasterChefPool {
    isV2: boolean;
    pid: Number;
    allocPoint: Number;
}

interface IInitTransfer {
    amount: BigNumber;
}

interface IRewarderConfigInput {
    REWARDER_TOKEN: string;
    LP_TOKEN: string;
    TOKEN_PER_SEC: BigNumber;
    MASTER_CHEF_JOE: string;
    IS_NATIVE: boolean;
}

interface IRewarderConfig {
    REWARDER_TOKEN_ADDRESS: string;
    LP_TOKEN: string;
    TOKEN_PER_SEC: BigNumber;
    MASTER_CHEF_JOE: string;
    IS_NATIVE: boolean;
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {


    const deploy = (await ethers.getSigners())[0]
    const config = ConfigEntity.getConfig()

    const rewarderConfigInput: IRewarderConfigInput = {
        REWARDER_TOKEN: "ETH.e",
        LP_TOKEN: "0x83FE3893033d601Cc2142221c5739B52379bc4E3",
        TOKEN_PER_SEC: ethers.utils.parseUnits('0.000001', 18),
        MASTER_CHEF_JOE: config.Exchanges.TraderJoe!.MasterChefJoeV3!,
        IS_NATIVE: false
    }

    const reset: IResetMasterChefPool = {
        isV2: false,
        pid: 6,
        allocPoint: 1000
    }

    const initTransfer: IInitTransfer = {
        amount: ethers.utils.parseUnits('20000000', 18)
    }

    const tokenList: any = config.Tokens

    const addr = tokenList[rewarderConfigInput.REWARDER_TOKEN]
    if (!addr) {
        throw `error : unable to find address of ${rewarderConfigInput.REWARDER_TOKEN}`
    }

    const rewarderConfig: IRewarderConfig = {
        REWARDER_TOKEN_ADDRESS: addr,
        LP_TOKEN: rewarderConfigInput.LP_TOKEN,
        TOKEN_PER_SEC: rewarderConfigInput.TOKEN_PER_SEC,
        MASTER_CHEF_JOE: rewarderConfigInput.MASTER_CHEF_JOE,
        IS_NATIVE: rewarderConfigInput.IS_NATIVE
    }


    console.log('>> Deploy simple rewarder')
    const SimpleRewarderPerSec = (await ethers.getContractFactory('SimpleRewarderPerSec', deploy)) as SimpleRewarderPerSec__factory
    const simpleRewarderPerSec = (await SimpleRewarderPerSec.deploy(
        rewarderConfig.REWARDER_TOKEN_ADDRESS,
        rewarderConfig.LP_TOKEN,
        rewarderConfig.TOKEN_PER_SEC,
        rewarderConfig.MASTER_CHEF_JOE,
        rewarderConfig.IS_NATIVE
    ))
    console.log(`>> Success deploy at ${simpleRewarderPerSec.address}`)
    console.log("✅ Done");


    if (reset) {
        console.log(">> Reset masterChef pool.")
        if(reset.isV2){
            const masterChef = MasterChefJoeV2__factory.connect(rewarderConfig.MASTER_CHEF_JOE, deploy)
            let tx = await masterChef.set(
                BigNumber.from(reset.pid),
                BigNumber.from(reset.allocPoint),
                simpleRewarderPerSec.address,
                true,{gasLimit: 4e6})
            await tx.wait()
            console.log("✅ Done");
        }else{
            const masterChef = MasterChefJoeV3__factory.connect(rewarderConfig.MASTER_CHEF_JOE, deploy)
            let tx = await masterChef.set(
                BigNumber.from(reset.pid),
                BigNumber.from(reset.allocPoint),
                simpleRewarderPerSec.address,
                true,{gasLimit: 4e6})
            await tx.wait()
            console.log("✅ Done");
        }

    }

    if (initTransfer) {
        console.log(">> Init transfer.")
        const erc20 = IERC20__factory.connect(rewarderConfig.REWARDER_TOKEN_ADDRESS, deploy)
        let tx = await erc20.transfer(simpleRewarderPerSec.address, initTransfer.amount)
        await tx.wait()
        console.log("✅ Done");
    }
}

export default func;
func.tags = ["TraderJoeSimpleRewarder"];
