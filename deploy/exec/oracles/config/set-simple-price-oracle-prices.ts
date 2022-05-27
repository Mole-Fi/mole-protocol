/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-02-22 14:19:42
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-16 22:06:43
 */
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { OracleMedianizer__factory, SimplePriceOracle__factory } from "../../../../typechain";
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

  const feeder = (await ethers.getSigners())[0]
  
  const config = ConfigEntity.getConfig();

  const TOKEN0_SYMBOLS = ["USDC","USDC.e"];
  const TOKEN1_SYMBOLS = ["USDC.e","USDC"];
  const PRICES = [ethers.utils.parseEther('1'),ethers.utils.parseEther('1')];

  const tokenList: any = config.Tokens;
  const token0Addrs: Array<string> = TOKEN0_SYMBOLS.map((t) => {
    const addr = tokenList[t];
    if (addr === undefined) {
      throw `error: token: unable to find address of ${t}`;
    }
    return addr;
  });
  const token1Addrs: Array<string> = TOKEN1_SYMBOLS.map((t) => {
    const addr = tokenList[t];
    if (addr === undefined) {
      throw `error: token: unable to find address of ${t}`;
    }
    return addr;
  });

  const simplePriceOracle = SimplePriceOracle__factory.connect(
      config.Oracle.SimpleOracle,
      feeder
  )

  console.log(">> Set prices to SimplePriceOracle");
  
  const tx = await simplePriceOracle.setPrices(token0Addrs,token1Addrs,PRICES);

  await tx.wait();

  console.log("✅ Done");
};

export default func;
func.tags = ["SetSimplePriceOraclePrices"];
