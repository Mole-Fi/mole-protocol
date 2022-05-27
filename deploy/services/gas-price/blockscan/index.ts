/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-04-18 14:13:36
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-24 14:26:28
 */
import axios from "axios";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { IGasPriceService } from "../interfaces";
import { IBlockScanGasResponse } from "./interfaces";

export class BlockScanGasPrice implements IGasPriceService {
  private networkName: string;
  private baseUrl: string;

  constructor(networkName: string) {
    let networkShorthand = "avax";
    this.baseUrl = `https://g${networkShorthand}.blockscan.com`;
    this.networkName = networkName;
  }

  async getFastGasPrice(): Promise<BigNumber> {
    const raw = await axios.get(`${this.baseUrl}/gasapi.ashx?apikey=key&method=gasoracle`);
    const resp = raw.data as IBlockScanGasResponse;
    return ethers.utils.parseUnits(resp.result.FastGasPrice, "gwei");
  }
}
