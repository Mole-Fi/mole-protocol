import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, upgrades } from "hardhat";
import {
  JoeRouter02__factory,
  MasterChefJoeV2__factory,
  MasterChefJoeV3__factory,
  MockERC20,
  MockERC20__factory,
  PancakeFactory__factory,
  WAVAX__factory
} from "../../../../typechain";
import { BigNumber } from "ethers";
import { ConfigEntity } from "../../../entities";

interface IPair {
  quoteToken: string;
  quoteTokenAddr: string;
  reserveQuoteToken: BigNumber;
  reserveBaseToken: BigNumber;
}

interface IToken {
  symbol: string;
  name: string;
  decimals?: string;
  address?: string;
  mintAmount?: BigNumber;
  pairs: Array<IPair>;
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const config = ConfigEntity.getConfig();

  const FOREVER = 20000000000;
  const JOE_FLAG_V2 = false;
  const JOE_FLAG_V3 = true;

  const MASTERCHEF = config.Exchanges.TraderJoe!.MasterChefJoeV3;
  const PANCAKE_FACTORY = config.Exchanges.TraderJoe!.JoeFactory;
  const PANCAKE_ROUTER = config.Exchanges.TraderJoe!.JoeRouter;
  const WAVAX = config.Tokens.WAVAX!;
  const REWARDER = ethers.constants.AddressZero;

  const TOKENS: Array<IToken> = [
    // {
    //   symbol: "USDT.e",
    //   name: "USDT.e",
    //   address: config.Tokens["USDT.e"]!,
    //   decimals: "6",
    //   // mintAmount: ethers.utils.parseUnits("800000000", 6),
    //   pairs: [
    //   ],
    // },
    // {
    //   symbol: "USDt",
    //   name: "USDt",
    //   address: config.Tokens.USDt!,
    //   decimals: "6",
    //   // mintAmount: ethers.utils.parseUnits("800000000", 6),
    //   pairs: [
    //     {
    //       quoteToken: "USDT.e",
    //       quoteTokenAddr: config.Tokens["USDT.e"]!,
    //       reserveQuoteToken: ethers.utils.parseUnits("4000000", 6),
    //       reserveBaseToken: ethers.utils.parseUnits("4000000", 6),
    //     },
    //   ],
    // }
    // {
    //   symbol: "USDC.e",
    //   name: "USDC.e",
    //   address: config.Tokens["USDC.e"]!,
    //   decimals: "6",
    //   // mintAmount: ethers.utils.parseUnits("800000000", 6),
    //   pairs: [
    //   ],
    // },
    // {
    //   symbol: "USDC",
    //   name: "USDC",
    //   address: config.Tokens.USDC!,
    //   decimals: "6",
    //   // mintAmount: ethers.utils.parseUnits("800000000", 6),
    //   pairs: [
    //     {
    //       quoteToken: "USDC.e",
    //       quoteTokenAddr: config.Tokens["USDC.e"]!,
    //       reserveQuoteToken: ethers.utils.parseUnits("20000000", 6),
    //       reserveBaseToken: ethers.utils.parseUnits("20000000", 6),
    //     },
    //   ],
    // }
    // {
    //   symbol: "JOE",
    //   name: "JOE",
    //   address: config.Tokens.JOE!,
    //   decimals: "18",
    //   pairs: [
    //     {
    //       quoteToken: "USDt",
    //       quoteTokenAddr: config.Tokens.USDt!,
    //       reserveQuoteToken: ethers.utils.parseUnits('10000', 6),
    //       reserveBaseToken: ethers.utils.parseUnits("100000", 18),
    //     },
    //     {
    //       quoteToken: "USDC",
    //       quoteTokenAddr: config.Tokens.USDC!,
    //       reserveQuoteToken: ethers.utils.parseUnits('10000', 6),
    //       reserveBaseToken: ethers.utils.parseUnits("100000", 18),
    //     }
    //   ]
    // },
    // {
    //   symbol: "USDC",
    //   name: "USDC",
    //   address: config.Tokens.USDC!,
    //   decimals: "6",
    //   pairs: [
    //     {
    //       quoteToken: "USDt",
    //       quoteTokenAddr: config.Tokens.USDt!,
    //       reserveQuoteToken: ethers.utils.parseUnits('20000000', 6),
    //       reserveBaseToken: ethers.utils.parseUnits("20000000", 6),
    //     }
    //   ]
    // }

    //
    // ================  JOE V3 =================
    //

    // {
    //   symbol: "ETH",
    //   name: "ETH",
    //   address: config.Tokens.ETH!,
    //   mintAmount: ethers.utils.parseUnits("800000000", 18),
    //   decimals: "18",
    //   pairs: [
    //     {
    //       quoteToken: "USDC.e",
    //       quoteTokenAddr: config.Tokens['USDC.e']!,
    //       reserveQuoteToken: ethers.utils.parseUnits('253800000', 6),
    //       reserveBaseToken: ethers.utils.parseUnits("100000", 18),
    //     }
    //   ]
    // },
    {
      symbol: "ETH.e",
      name: "ETH.e",
      address: config.Tokens['ETH.e']!,
      mintAmount: ethers.utils.parseUnits("800000000", 18),
      decimals: "18",
      pairs: [
        // {
        //   quoteToken: "USDC.e",
        //   quoteTokenAddr: config.Tokens['USDC.e']!,
        //   reserveQuoteToken: ethers.utils.parseUnits('252100000', 6),
        //   reserveBaseToken: ethers.utils.parseUnits("100000", 18),
        // },
        {
          quoteToken: "USDC",
          quoteTokenAddr: config.Tokens['USDC']!,
          reserveQuoteToken: ethers.utils.parseUnits('252100000', 6),
          reserveBaseToken: ethers.utils.parseUnits("100000", 18),
        }
      ]
    }

    //
    // ================ reinvest in JOE v3 ===============
    //
    // {
    //   symbol: "JOE",
    //   name: "JOE",
    //   address: config.Tokens.JOE!,
    //   decimals: "18",
    //   pairs: [
    //     // {
    //     //   quoteToken: "ETH",
    //     //   quoteTokenAddr: config.Tokens.ETH!,
    //     //   reserveQuoteToken: ethers.utils.parseUnits('10', 18),
    //     //   reserveBaseToken: ethers.utils.parseUnits("250000", 18),
    //     // },
    //     // {
    //     //   quoteToken: "ETH.e",
    //     //   quoteTokenAddr: config.Tokens["ETH.e"]!,
    //     //   reserveQuoteToken: ethers.utils.parseUnits('10', 18),
    //     //   reserveBaseToken: ethers.utils.parseUnits("250000", 18),
    //     // }
    //     // {
    //     //   quoteToken: "USDC",
    //     //   quoteTokenAddr: config.Tokens['USDC']!,
    //     //   reserveQuoteToken: ethers.utils.parseUnits('10000', 6),
    //     //   reserveBaseToken: ethers.utils.parseUnits("100000", 18),
    //     // }
    //   ]
    // },
    // {
    //   symbol: "ETH",
    //   name: "ETH",
    //   address: config.Tokens.ETH!,
    //   decimals: "18",
    //   pairs: [
    //     // rewarder swap
    //     {
    //       quoteToken: "ETH.e",
    //       quoteTokenAddr: config.Tokens['ETH.e']!,
    //       reserveQuoteToken: ethers.utils.parseUnits('100000', 18),
    //       reserveBaseToken: ethers.utils.parseUnits("100000", 18),
    //     }
    //     ,// dnVault reinvest
    //     {
    //       quoteToken: "MOLE",
    //       quoteTokenAddr: config.Tokens.MOLE!,
    //       reserveQuoteToken: ethers.utils.parseUnits('25000',18),
    //       reserveBaseToken: ethers.utils.parseUnits('0.1',18)
    //     }
    //   ]
    // }

    // ============ 
    // {
    //   symbol: "ETH",
    //   name: "ETH",
    //   address: config.Tokens.ETH!,
    //   decimals: "18",
    //   pairs: [
    //     {
    //       quoteToken: "USDC",
    //       quoteTokenAddr: config.Tokens.USDC!,
    //       reserveQuoteToken: ethers.utils.parseUnits('253800000', 6),
    //       reserveBaseToken: ethers.utils.parseUnits("100000", 18),
    //     }
    //   ]
    // },
    // {
    //   symbol: "MOLE",
    //   name: "MOLE",
    //   address: config.Tokens.MOLE!,
    //   decimals: "18",
    //   pairs: [
    //     {
    //       quoteToken: "USDC",
    //       quoteTokenAddr: config.Tokens.USDC!,
    //       reserveQuoteToken: ethers.utils.parseUnits('1000', 6),
    //       reserveBaseToken: ethers.utils.parseUnits("100000", 18),
    //     }
    //   ]
    // }
  ];

  const deployer = (await ethers.getSigners())[0];

  const factory = PancakeFactory__factory.connect(PANCAKE_FACTORY, deployer);
  const router = JoeRouter02__factory.connect(PANCAKE_ROUTER, deployer);
  const pancakeMasterchef = MasterChefJoeV2__factory.connect(MASTERCHEF, deployer);
  const wbnb = WAVAX__factory.connect(WAVAX, deployer);

  const MockERC20 = (await ethers.getContractFactory("MockERC20", deployer)) as MockERC20__factory;


  for (let i = 0; i < TOKENS.length; i++) {
    console.log("============================================");
    let token: MockERC20;
    
    if (TOKENS[i].address === undefined) {
      // deploy token
      console.log(`>> Deploying ${TOKENS[i].symbol}`);
      token = (await upgrades.deployProxy(MockERC20, [
        TOKENS[i].name,
        TOKENS[i].symbol,
        TOKENS[i].decimals,
      ])) as MockERC20;
      await token.deployTransaction.wait(3);
      TOKENS[i].address = token.address
      console.log(`>> ${TOKENS[i].symbol} deployed at: ${token.address}`);
    } else {
      console.log(`>> ${TOKENS[i].symbol} is deployed at ${TOKENS[i].address}`);
      token = MockERC20__factory.connect(TOKENS[i].address!, deployer);
    }

    if (TOKENS[i].mintAmount !== undefined) {
      // mint token
      console.log(`>> Minting ${TOKENS[i].mintAmount} ${TOKENS[i].symbol}`);
      await (await token.mint(deployer.address, TOKENS[i].mintAmount!)).wait(3);
      console.log(`✅ Done`);
    }
  }

  for (let i = 0; i < TOKENS.length; i++) {
    console.log("============================================");
    let token: MockERC20;

    if (TOKENS[i].address === undefined) {
      throw `Unexpect exception`
    } else {
      token = MockERC20__factory.connect(TOKENS[i].address!, deployer);
    }
    // mock liquidity
    for (let j = 0; j < TOKENS[i].pairs.length; j++) {
      if (TOKENS[i].pairs[j].quoteTokenAddr === undefined) {
        TOKENS.filter(v => v.symbol === TOKENS[i].pairs[j].quoteToken).forEach(v => TOKENS[i].pairs[j].quoteTokenAddr = v.address!)
      }

      const quoteToken = MockERC20__factory.connect(TOKENS[i].pairs[j].quoteTokenAddr, deployer);

      let lp = await factory.getPair(token.address, quoteToken.address);

      if (lp.toLowerCase() === ethers.constants.AddressZero.toLowerCase()) {
        console.log(`>> Creating the ${TOKENS[i].symbol}-${TOKENS[i].pairs[j].quoteToken} Trading Pair`);

        await (
          await factory.createPair(token.address, TOKENS[i].pairs[j].quoteTokenAddr, { gasLimit: 3000000 })
        ).wait(3);
        console.log(`✅ Done`);
      }

      // if quoteToken is WBNB, wrap it before add Liquidity
      if (quoteToken.address.toLowerCase() == wbnb.address.toLowerCase()) {
        console.log(`>> Wrapping ${TOKENS[i].pairs[j].reserveQuoteToken} BNB`);
        await (await wbnb.deposit({ value: TOKENS[i].pairs[j].reserveQuoteToken })).wait(3);
        console.log(`✅ Done`);
      }

      // add liquidity
      console.log(`>> Adding liquidity for ${TOKENS[i].symbol}-${TOKENS[i].pairs[j].quoteToken}`);
      await (
        await token.approve(router.address, TOKENS[i].pairs[j].reserveBaseToken)
      ).wait();
      console.log('>> Approve baseToken ok.')
      await (
        await quoteToken.approve(router.address, TOKENS[i].pairs[j].reserveQuoteToken)
      ).wait();
      console.log('>> Approve quoteToken ok.')
      const addLiqTx = await router.addLiquidity(
        token.address,
        quoteToken.address,
        TOKENS[i].pairs[j].reserveBaseToken,
        TOKENS[i].pairs[j].reserveQuoteToken,
        "0",
        "0",
        deployer.address,
        FOREVER,
        { gasLimit: 5000000 }
      );
      await addLiqTx.wait();
      console.log(`✅ Done at ${addLiqTx.hash}`);

      lp = await factory.getPair(token.address, quoteToken.address);
      console.log(`>> Adding the ${TOKENS[i].symbol}-${TOKENS[i].pairs[j].quoteToken} LP to MasterChef`);
      console.log(`>> ${TOKENS[i].symbol}-${TOKENS[i].pairs[j].quoteToken} LP address: ${lp}`);


      if (JOE_FLAG_V2) {
        const masterChefJoeV2 = MasterChefJoeV2__factory.connect(MASTERCHEF, deployer);
        const addPoolTx = await masterChefJoeV2.add(1000, lp, REWARDER);
        await addPoolTx.wait();
        console.log(`✅ Done at ${addPoolTx.hash}`);
      }
      else if (JOE_FLAG_V3) {
        const masterChefJoeV3 = MasterChefJoeV3__factory.connect(MASTERCHEF, deployer);

        console.log(`>> Before add lp to masterChef, pool length is ${(await masterChefJoeV3.poolLength()).toString()}, new pair pid will be it.`)

        const addPoolTx = await masterChefJoeV3.add(1000, lp, REWARDER);
        await addPoolTx.wait();
        console.log(`✅ Done at ${addPoolTx.hash}`);
      }
    }
  }
};

export default func;
func.tags = ["TestnetDeployTokensJoe"];
