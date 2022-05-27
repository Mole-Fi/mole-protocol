/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-05-12 19:39:34
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-13 11:07:19
 */

import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { JoeFactory__factory, JoeRouter02__factory, JoeToken__factory, MasterChefJoeV2__factory } from "../../../../typechain";
import { ConfigEntity } from "../../../entities";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    

    const START_TIME = BigNumber.from(0);
    const PREMINT_BOO = ethers.utils.parseEther("2000000");
    const JOE_PER_SEC = ethers.utils.parseEther("0.1");
    const WAVAX = ConfigEntity.getConfig().Tokens.WAVAX!;

    const TREASURY_ADDR = '0x247aB5e894b2e04229bAf5F8A440D7ee9cf757aa'
    const INVESTOR_ADDR = '0x15ef648a27F160b75ae816aAE319016007C8805b'

    const DEV_PERCENT = 200;
    const TREASURY_PERCENT = 200;
    const INVESTOR_PERCENT = 100;

    const deployer = (await ethers.getSigners())[0];

    console.log("> Deploying JoeFactory")
    const JoeFactory = (await ethers.getContractFactory("JoeFactory", deployer)) as JoeFactory__factory;
    const factory = await JoeFactory.deploy(deployer.address)
    await factory.deployTransaction.wait(3);
    console.log("JoeFactory:", factory.address);
    console.log("✅ Done");

    console.log("> Deploying JoeRouter02")
    const JoeRouter02 = (await ethers.getContractFactory("JoeRouter02", deployer)) as JoeRouter02__factory;
    const router = await JoeRouter02.deploy(factory.address, WAVAX);
    await router.deployTransaction.wait(3);
    console.log("JoeRouter02:", router.address);
    console.log("✅ Done");


    console.log("> Deploying JoeToken");
    const JoeToken = (await ethers.getContractFactory("contracts/6.12/protocol/apis/trader-joe/JoeToken.sol:JoeToken", deployer)) as JoeToken__factory;
    const joe = await JoeToken.deploy();
    await joe.deployTransaction.wait(3);
    console.log("JoeToken:", joe.address);
    console.log("✅ Done");

    console.log("> Minting some JOE");
    await (await joe.mint(deployer.address, PREMINT_BOO)).wait(3);
    console.log("✅ Done");

    /// Setup MasterChef
    console.log("> Deploying MasterChefJoeV2");
    const MasterChefJoeV2 = (await ethers.getContractFactory("MasterChefJoeV2", deployer)) as MasterChefJoeV2__factory;
    const masterChefJoeV2 =
        await MasterChefJoeV2.deploy(
            joe.address,
            deployer.address,
            TREASURY_ADDR,
            INVESTOR_ADDR,
            JOE_PER_SEC,
            START_TIME,
            DEV_PERCENT,
            TREASURY_PERCENT,
            INVESTOR_PERCENT);
    await masterChefJoeV2.deployTransaction.wait(3);
    console.log("MasterChefJoeV2:", masterChefJoeV2.address);
    console.log("✅ Done");

    console.log("> Setting JOE ownership to MasterChefJoeV2")
    await (await joe.transferOwnership(masterChefJoeV2.address)).wait(3);
    console.log("✅ Done");

}

export default func;
func.tags = ["TraderJoeSwap"];
