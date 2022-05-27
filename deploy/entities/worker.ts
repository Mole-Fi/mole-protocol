/*
 * @Description: 
 * @Author: Hungry
 * @Date: 2022-05-24 11:29:27
 * @LastEditors: Hungry
 * @LastEditTime: 2022-05-24 15:12:21
 */
import { WorkersEntity } from "../interfaces/config";
import { getConfig } from "./config";

export type IWorkers = Array<WorkersEntity>;

export interface IMiniWorker {
  name: string;
  address: string;
}


export function mapWorkers(workerNames: Array<String>): Array<WorkersEntity> {
  const config = getConfig();

  const allWorkers: IWorkers = config.Vaults.reduce((accum, vault) => {
    return accum.concat(
      vault.workers.map((worker) => {
        return worker;
      })
    );
  }, [] as IWorkers);

  const mappedWorkers: IWorkers = workerNames.map((workerName) => {
    // 1. find each worker having an identical name as workerName
    // 2. if hit return
    // 3. other wise throw error
    const hit = allWorkers.find((worker) => {
      return worker.name === workerName;
    });

    if (!!hit) return hit;

    throw new Error(`could not find ${workerName}`);
  });

  return mappedWorkers;
}
