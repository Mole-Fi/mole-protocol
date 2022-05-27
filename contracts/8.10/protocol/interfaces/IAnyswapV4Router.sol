// SPDX-License-Identifier: MIT


pragma solidity 0.8.10;

interface IAnyswapV4Router {
  function anySwapOutUnderlying(
    address token,
    address to,
    uint256 amount,
    uint256 toChainID
  ) external;

  function mpc() external view returns (address);
}
