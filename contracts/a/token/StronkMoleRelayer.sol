

pragma solidity 0.6.6;

import "./interfaces/IMoleToken.sol";
import "./interfaces/IStronkMoleRelayer.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


contract StronkMoleRelayer is Ownable, IStronkMoleRelayer, ReentrancyGuard {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  // Mole address
  address public moleTokenAddress;

  // User address
  address public userAddress;

  constructor(
    address _moleAddress,
    address _userAddress
  ) public {
    moleTokenAddress = _moleAddress;
    userAddress = _userAddress;
  }

  function transferAllMole() external override nonReentrant onlyOwner {
    SafeERC20.safeTransfer(IERC20(moleTokenAddress), userAddress, IERC20(moleTokenAddress).balanceOf(address(this)));
    IMoleToken(moleTokenAddress).transferAll(msg.sender);
  }
}
