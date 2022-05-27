// SPDX-License-Identifier: MIT


pragma solidity 0.8.10;

interface IChainLinkPriceOracle {
  function getPrice(address token0, address token1) external view returns (uint256, uint256);
}
