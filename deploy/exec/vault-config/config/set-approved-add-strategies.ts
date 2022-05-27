// import { HardhatRuntimeEnvironment } from "hardhat/types";
// import { DeployFunction } from "hardhat-deploy/types";
// import { ethers, network } from "hardhat";
// import { Timelock__factory } from "../../../../typechain";
// import MainnetConfig from "../../../../.mainnet.json";
// import TestnetConfig from "../../../../.testnet.json";
// import { TimelockEntity } from "../../../entities";
// import { FileService, TimelockService } from "../../../services";

// interface IInput {
//   VAULT_SYMBOL: string;
//   ADD_STRATEGIES: string[];
//   IS_ENABLE: boolean;
// }

// interface IDerivedInput {
//   configAddress: string;
//   addStrategies: string[];
//   isEnable: boolean;
// }

// const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
//   /*
//   ░██╗░░░░░░░██╗░█████╗░██████╗░███╗░░██╗██╗███╗░░██╗░██████╗░
//   ░██║░░██╗░░██║██╔══██╗██╔══██╗████╗░██║██║████╗░██║██╔════╝░
//   ░╚██╗████╗██╔╝███████║██████╔╝██╔██╗██║██║██╔██╗██║██║░░██╗░
//   ░░████╔═████║░██╔══██║██╔══██╗██║╚████║██║██║╚████║██║░░╚██╗
//   ░░╚██╔╝░╚██╔╝░██║░░██║██║░░██║██║░╚███║██║██║░╚███║╚██████╔╝
//   ░░░╚═╝░░░╚═╝░░╚═╝░░╚═╝╚═╝░░╚═╝╚═╝░░╚══╝╚═╝╚═╝░░╚══╝░╚═════╝░
//   Check all variables below before execute the deployment script
//   */
//   const TITLE = "mainnet_mdex_set_approved_add_strategies";
//   const TARGETED_VAULT_CONFIG: Array<IInput> = [
//     {
//       VAULT_SYMBOL: "ibWBNB",
//       ADD_STRATEGIES: ["0x632e03943Dd4c5c509486233b345FAE86cD5517a", "0xD8A128e5712D9b240811a0D55D3F9CA8E6599B7A"],
//       IS_ENABLE: true,
//     },
//     {
//       VAULT_SYMBOL: "ibBUSD",
//       ADD_STRATEGIES: ["0x632e03943Dd4c5c509486233b345FAE86cD5517a", "0x632188A1b2f3a2636B59a1c400835e2C5EA40214"],
//       IS_ENABLE: true,
//     },
//     {
//       VAULT_SYMBOL: "ibETH",
//       ADD_STRATEGIES: ["0x632e03943Dd4c5c509486233b345FAE86cD5517a", "0xB16912cbb98C7ef7aAD30268bDC5602dBb5833f9"],
//       IS_ENABLE: true,
//     },
//     {
//       VAULT_SYMBOL: "ibMOLE",
//       ADD_STRATEGIES: ["0x632e03943Dd4c5c509486233b345FAE86cD5517a", "0x090ff57ffD64593111b0Aa7f2D664b1Aa3066137"],
//       IS_ENABLE: true,
//     },
//     {
//       VAULT_SYMBOL: "ibUSDT",
//       ADD_STRATEGIES: ["0x632e03943Dd4c5c509486233b345FAE86cD5517a", "0x0768EF9E891725C4c65f3E0fB671aBCD66FC6bee"],
//       IS_ENABLE: true,
//     },
//     {
//       VAULT_SYMBOL: "ibBTCB",
//       ADD_STRATEGIES: ["0x632e03943Dd4c5c509486233b345FAE86cD5517a", "0x34Cce22a47C5f020A5cc4fCc63d231D46577415a"],
//       IS_ENABLE: true,
//     },
//     {
//       VAULT_SYMBOL: "ibTUSD",
//       ADD_STRATEGIES: ["0x632e03943Dd4c5c509486233b345FAE86cD5517a", "0xC9B12a6900c53A9d0eaEd911c1f46f6A1CC8E7Ad"],
//       IS_ENABLE: true,
//     },
//   ];
//   const EXACT_ETA = "1632903300";

//   const config = network.name === "mainnet" ? MainnetConfig : TestnetConfig;
//   const timelockTransactions: Array<TimelockEntity.Transaction> = [];

//   const inputs: Array<IDerivedInput> = TARGETED_VAULT_CONFIG.map((tv) => {
//     const vault = config.Vaults.find((v) => tv.VAULT_SYMBOL == v.symbol);
//     if (vault === undefined) {
//       throw `error: not found vault with ${tv} symbol`;
//     }
//     if (vault.config === "") {
//       throw `error: not found config address`;
//     }

//     return {
//       configAddress: vault.config,
//       addStrategies: tv.ADD_STRATEGIES,
//       isEnable: tv.IS_ENABLE,
//     };
//   });

//   for (const i of inputs) {
//     timelockTransactions.push(
//       await TimelockService.queueTransaction(
//         `>> Queue tx on Timelock to setApprovedStrategies for ${i.configAddress}`,
//         i.configAddress,
//         "0",
//         "setApprovedAddStrategy(address[],bool)",
//         ["address[]", "bool"],
//         [i.addStrategies, i.isEnable],
//         EXACT_ETA
//       )
//     );
//   }

//   FileService.write(TITLE, timelockTransactions);
// };

// export default func;
// func.tags = ["SetApprovedAddStrategies"];
