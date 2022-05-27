export interface Config {
  ProxyAdmin: string;
  Timelock: string;
  Shield?: string;
  RevenueTreasury?: string;
  MerkleDistributor?: MerkleDistributor;
  GrazingRange?: GrazingRange;
  FairLaunch?: FairLaunch;
  MiniFL?: MiniFL;
  Exchanges: Exchanges;
  Tokens: Tokens;
  LpTokens?: LpTokens;
  SharedStrategies: SharedStrategies;
  SharedConfig: SharedConfig;
  Oracle: Oracle;
  Vaults: VaultsEntity[];
  DeltaNeutralVaults?: DeltaNeutralVaultsEntity[];
}
export interface MerkleDistributor {
  "ITAM-week-1": string;
  "ITAM-week-2": string;
  "ITAM-week-3": string;
  "ITAM-week-4": string;
}
export interface GrazingRange {
  address: string;
  deployedBlock: number;
  pools: PoolsEntity[];
}
export interface PoolsEntity {
  id: number;
  name: string;
  stakingToken: string;
  rewardToken: string;
}
export interface FairLaunch {
  address: string;
  deployedBlock: number;
  pools: PoolsEntity1[];
}
export interface PoolsEntity1 {
  id: number;
  stakingToken: string;
  address: string;
}
export interface MiniFL {
  address: string;
  deployedBlock: number;
  pools: PoolsEntity2[];
}
export interface PoolsEntity2 {
  id: number;
  stakingToken: string;
  address: string;
  rewarder: string;
}
export interface Exchanges {
  Pancakeswap?: Pancakeswap;
  Waultswap?: Waultswap;
  Mdex?: Mdex;
  SpookySwap?: SpookySwap;
  TraderJoe?: TraderJoe;
}
export interface Pancakeswap {
  UniswapV2Factory: string;
  UniswapV2Router02: string;
  FactoryV2: string;
  RouterV2: string;
  MasterChef: string;
  LpTokens: LpTokensEntity[];
}
export interface LpTokensEntity {
  pId: number;
  name: string;
  address: string;
  masterChef?: string;
}
export interface Waultswap {
  WexMaster: string;
  WaultswapRouter: string;
  WaultswapFactory: string;
  LpTokens: LpTokensEntity[];
}
export interface Mdex {
  BSCPool: string;
  MdexFactory: string;
  MdexRouter: string;
  SwapMining: string;
  LpTokens: LpTokensEntity[];
}
export interface SpookySwap {
  SpookyFactory: string;
  SpookyRouter: string;
  SpookyMasterChef: string;
  LpTokens: LpTokensEntity[];
}
export interface TraderJoe {
  JoeFactory: string;
  JoeRouter: string;
  MasterChefJoeV2: string;
  MasterChefJoeV3: string;
  BoostedMasterChefJoe?: string;
  LpTokens: LpTokensEntity[];
}

export interface Tokens {
  BNB?: string;
  WBNB?: string;
  MOLE?: string;
  sMOLE?: string;
  BUSD?: string;
  CAKE?: string;
  SYRUP?: string;
  USDT?: string;
  BTCB?: string;
  ETH?: string;
  DOT?: string;
  UNI?: string;
  LINK?: string;
  XVS?: string;
  YFI?: string;
  VAI?: string;
  USDC?: string;
  DAI?: string;
  UST?: string;
  BETH?: string;
  COMP?: string;
  SUSHI?: string;
  ITAM?: string;
  bMXX?: string;
  BELT?: string;
  BOR?: string;
  BRY?: string;
  pCWS?: string;
  SWINGBY?: string;
  DODO?: string;
  WEX?: string;
  BORING?: string;
  WAULTx?: string;
  ODDZ?: string;
  ADA?: string;
  FORM?: string;
  MATIC?: string;
  TUSD?: string;
  TRX?: string;
  BTT?: string;
  ORBS?: string;
  AXS?: string;
  PMON?: string;
  PHA?: string;
  WUSD?: string;
  ALM?: string;
  KALA?: string;
  SCIX?: string;
  NAOS?: string;
  MBOX?: string;
  MDX?: string;
  BMON?: string;
  ARV?: string;
  WFTM?: string;
  WAVAX?: string;
  BOO?: string;
  USD?: string;
  JOE?: string;
  USDt?: string;
  "USDT.e"?: string;
  "USDC.e"?: string;
  "ETH.e"?: string;
  "sAVAX"?: string;
  QI?:string;
}
export interface LpTokens {
  "MOLE-WBNB": string;
  "MOLE-WBNB (Legacy)": string;
  "sMOLE-MOLE": string;
}
export interface SharedStrategies {
  Pancakeswap?: PancakeswapOrWaultswapOrPancakeswapSingleAsset;
  Waultswap?: PancakeswapOrWaultswapOrPancakeswapSingleAsset;
  PancakeswapSingleAsset?: PancakeswapOrWaultswapOrPancakeswapSingleAsset;
  Mdex?: PancakeswapOrWaultswapOrPancakeswapSingleAsset;
  SpookySwap?: PancakeswapOrWaultswapOrPancakeswapSingleAsset;
  TraderJoe?: PancakeswapOrWaultswapOrPancakeswapSingleAsset;
}
export interface PancakeswapOrWaultswapOrPancakeswapSingleAsset {
  StrategyAddBaseTokenOnly: string;
  StrategyLiquidate: string;
  StrategyWithdrawMinimizeTrading: string;
  StrategyPartialCloseLiquidate: string;
  StrategyPartialCloseMinimizeTrading: string;
}
export interface SharedConfig {
  TripleSlopeModel: string;
  TripleSlopeModelStable20Max150?: string;
  TripleSlopeModel103?: string;
  WNativeRelayer: string;
  WorkerConfig: string;
  PancakeswapSingleAssetWorkerConfig?: string;
}
export interface Oracle {
  OracleMedianizer: string;
  ChainLinkOracle: string;
  SimpleOracle: string;
  DeltaNeutralOracle?: string;
}
export interface VaultsEntity {
  name: string;
  symbol: string;
  address: string;
  deployedBlock: number;
  baseToken: string;
  debtToken: string;
  config: string;
  tripleSlopeModel: string;
  StrategyAddTwoSidesOptimal: StrategyAddTwoSidesOptimal;
  workers: WorkersEntity[];
}
export interface StrategyAddTwoSidesOptimal {
  Pancakeswap?: string;
  Waultswap?: string;
  PancakeswapSingleAsset?: string;
  Mdex?: string;
  SpookySwap?: string;
  TraderJoe?: string;
}
export interface WorkersEntity {
  name: string;
  address: string;
  deployedBlock: number;
  config: string;
  pId: number;
  stakingToken: string;
  stakingTokenAt: string;
  strategies: Strategies;
}
export interface Strategies {
  StrategyAddAllBaseToken: string;
  StrategyLiquidate: string;
  StrategyAddTwoSidesOptimal: string;
  StrategyWithdrawMinimizeTrading: string;
  StrategyPartialCloseLiquidate: string;
  StrategyPartialCloseMinimizeTrading: string;
}
export interface DeltaNeutralVaultsEntity {
  name: string;
  symbol: string;
  address: string;
  deployedBlock: number;
  config: string;
  assetToken: string;
  stableToken: string;
  assetVault: string;
  stableVault: string;
  assetDeltaWorker: string;
  stableDeltaWorker: string;
  gateway: string;
  oracle: string;
  assetVaultPosId: string;
  stableVaultPosId: string;
}
