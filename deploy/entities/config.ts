/*
 * @Description: et
 * @Author: Hungry
 * @Date: 2022-02-22 14:19:42
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-24 14:23:12
 */
import { network } from "hardhat";
import AvalancheTestnetConfig from "../../.avalanche_testnet.json"
import AvalancheMainnetConfig from "../../.avalanche_mainnet.json"
import { Config } from "../interfaces/config";

export function getConfig(): Config {

  if(network.name === "avalanche_testnet"){
    return AvalancheTestnetConfig;
  }
  if(network.name === "avalanche_mainnet"){
    return AvalancheMainnetConfig
  }

  throw new Error("not found config");
}
