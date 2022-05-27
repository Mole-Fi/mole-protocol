/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-05-18 16:55:31
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-18 17:20:20
 */

import { BigNumber } from "ethers";
import { ethers, upgrades } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { IERC20__factory, MasterChefJoeV2__factory, MasterChefJoeV3__factory, MockERC20, MockERC20__factory, SimpleRewarderPerSec__factory } from "../../../../typechain";
import { ConfigEntity } from "../../../entities";



const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {


    const deployer = (await ethers.getSigners())[0]
    const config = ConfigEntity.getConfig()

    console.log(`>> Deploy dummy token for claim reward from masterChefV2`)

    const MockERC20 = (await ethers.getContractFactory("MockERC20", deployer)) as MockERC20__factory
    const dummyToken = (await upgrades.deployProxy(MockERC20, [
        "Joe Dummy Token",
        "DUMMY",
        18,
    ])) as MockERC20;

    await (
        await dummyToken.mint(deployer.address, ethers.utils.parseEther('1'))
    ).wait()

    console.log(`✅ Done deploy at ${dummyToken.address}`);


    console.log('>> Add dummy as stakingToken to masterChefV2')
    const masterChefJoeV2Addr = config.Exchanges.TraderJoe?.MasterChefJoeV2!
    const masterChefJoeV2 = MasterChefJoeV2__factory.connect(masterChefJoeV2Addr, deployer)
    const poolLength = await masterChefJoeV2.poolLength()
    let tx = await masterChefJoeV2.add(2000, dummyToken.address, ethers.constants.AddressZero)
    await tx.wait()
    console.log(`✅ Done`)

    console.log(`>> Verify dummy token is ${poolLength} th pool stakingToken`)
    const poolInfo = await masterChefJoeV2.poolInfo(poolLength)

    if (poolInfo.lpToken.toLowerCase() !== dummyToken.address.toLowerCase()) {
        throw `Please check it.`
    }


    {
        console.log('>> Deploy masterChefV3')

        const PID = poolLength
        const MASTER_CHEF_V2 = config.Exchanges.TraderJoe?.MasterChefJoeV2!
        const JOE = config.Tokens['JOE']

        if (!PID || !MASTER_CHEF_V2 || !JOE) {
            throw `Invalid param.`
        }

        const MasterChefJoeV3 = (await ethers.getContractFactory("MasterChefJoeV3", deployer)) as MasterChefJoeV3__factory
        const masterChefJoeV3 = await MasterChefJoeV3.deploy(MASTER_CHEF_V2, JOE, PID)

        console.log(`✅ Done deploy at ${masterChefJoeV3.address}`)

        console.log('>> Init masterChefV3')

        await (
            await dummyToken.approve(masterChefJoeV3.address, ethers.utils.parseEther('1'))
        ).wait()

        await(
            await masterChefJoeV3.init(dummyToken.address)
        ).wait()
        
        console.log(`✅ Done`)
        
    }

}

export default func;
func.tags = ["TraderJoeSwapMasterChefV3"];
