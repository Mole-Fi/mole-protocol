// SPDX-License-Identifier: MIT


pragma solidity 0.8.10;

import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

import "../../token/interfaces/IAnyswapV1ERC20.sol";

contract MockAnySwapV4Router {
  using SafeERC20Upgradeable for IERC20Upgradeable;

  function anySwapOutUnderlying(
    address token,
    address, /* to*/
    uint256 amount,
    uint256 /* toChainID */
  ) external {
    IERC20Upgradeable(IAnyswapV1ERC20(token).underlying()).safeTransferFrom(msg.sender, token, amount);
  }

  function mpc() public view returns (address) {
    return address(this);
  }
}
