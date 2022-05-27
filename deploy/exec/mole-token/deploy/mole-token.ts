/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-03-16 20:44:13
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-24 10:24:46
 */
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';
import { MoleToken__factory, FairLaunch__factory } from '../../../../typechain';

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

//#region mole params
  
  //block release
  const MOLE_START_RELEASE = '0'; 
  const MOLE_END_RELEASE = '1';  

//#endregion

//#region FairLaunch param

  const MOLE_REWARD_PER_BLOCK = ethers.utils.parseEther('0.01');

  let START_BLOCK = 0;
  //unit 1e5 

  const BONUS_LOCK_BPS = 0; // 7%
  const BONUS_END_BLOCK = 0;
  const BONUS_MULTIPLIER = 7;

//endregion

  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const moleTx = await deploy('MoleToken', {
    from: admin.address,
    args: [
      MOLE_START_RELEASE,
      MOLE_END_RELEASE,
    ],
    log: true,
    deterministicDeployment: false,
  });

  let moleNum = moleTx.receipt?.blockNumber!

  if(START_BLOCK === 0){
    START_BLOCK = moleNum + 100
  }

  const moleToken = MoleToken__factory.connect(
    (await deployments.get('MoleToken')).address, admin);



  let deployResult =  await deploy('FairLaunch', {
    from: admin.address,
    args: [
      moleToken.address,
      admin.address,
      MOLE_REWARD_PER_BLOCK,
      START_BLOCK, BONUS_LOCK_BPS, BONUS_END_BLOCK
    ],
    log: true,
    deterministicDeployment: false,
  })

  console.log('FairLaunch deploy block : ',deployResult.receipt?.blockNumber)

  const fairLaunch = FairLaunch__factory.connect(
    (await deployments.get('FairLaunch')).address, admin)

  console.log(">> Transferring ownership of MoleToken from deployer to FairLaunch");
  await moleToken.transferOwnership(fairLaunch.address, { gasLimit: '500000' });
  console.log("✅ Done");

  // console.log(`>> Set Fair Launch bonus to BONUS_MULTIPLIER: "${BONUS_MULTIPLIER}", BONUS_END_BLOCK: "${BONUS_END_BLOCK}", LOCK_BPS: ${BONUS_LOCK_BPS}`)
  // await fairLaunch.setBonus(BONUS_MULTIPLIER, BONUS_END_BLOCK, BONUS_LOCK_BPS)
  // console.log("✅ Done");
};

export default func;
func.tags = ['FairLaunch'];