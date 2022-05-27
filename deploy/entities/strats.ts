/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-05-24 11:29:27
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-24 15:10:02
 */
import { ContractFactory } from "ethers";
import { getConfig } from "./config";
import { ethers } from "hardhat";



export enum Strats {
  btokenOnly = 0,
  twosides = 1,
  liquidateAll = 2,
  withdrawMinimize = 3,
  partialCloseLiquidate = 4,
  partialCloseWithdrawMinizmie = 5,
}

