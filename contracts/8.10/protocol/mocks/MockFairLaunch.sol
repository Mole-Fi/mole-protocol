// SPDX-License-Identifier: MIT


pragma solidity 0.8.10;

import "../../token/interfaces/IFairLaunch.sol";
import "../../utils/SafeToken.sol";

// FairLaunch is a smart contract for distributing MOLE by asking user to stake the ERC20-based token.
contract MockFairLaunch is IFairLaunch {
  using SafeToken for address;

  error MockFairLaunch_NotImplemented();
  // Info of each pool.
  struct PoolInfo {
    address stakeToken; // Address of Staking token contract.
    uint256 allocPoint; // How many allocation points assigned to this pool. MOLEs to distribute per block.
    uint256 lastRewardBlock; // Last block number that MOLEs distribution occurs.
    uint256 accMolePerShare; // Accumulated MOLEs per share, times 1e12. See below.
    uint256 accMolePerShareTilBonusEnd; // Accumated MOLEs per share until Bonus End.
  }

  // The Mole TOKEN!
  address public mole;
  address public proxyToken;
  uint256 public constant DEFAULT_HARVEST_AMOUNT = 10 * 1e18;

  uint256 public override poolLength;
  PoolInfo[] public override poolInfo;

  uint256 private mockPendingMole;

  constructor(address _mole, address _proxyToken) {
    mole = _mole;
    proxyToken = _proxyToken;
  }

  // Not used in test
  function setPool(
    uint256 _pid,
    uint256 _allocPoint,
    bool _withUpdate
  ) external pure {
    //avoid warning
    _pid = 0;
    _allocPoint = 0;
    _withUpdate = true;
    revert MockFairLaunch_NotImplemented();
  }

  function pendingMole(uint256 _pid, address _user) external view returns (uint256) {
    //avoid waring
    _pid = 0;
    _user = address(0);
    return mockPendingMole;
  }

  function setPendingMole(uint256 _mockPendingMole) external {
    mockPendingMole = _mockPendingMole;
  }

  // Not used in test
  function updatePool(uint256 _pid) external pure {
    //avoid warning
    _pid = 0;
    revert MockFairLaunch_NotImplemented();
  }

  // Not used in test
  function getFairLaunchPoolId() external pure returns (uint256) {
    revert MockFairLaunch_NotImplemented();
  }

  function addPool(
    uint256 _allocPoint,
    address _stakeToken,
    bool _withUpdate
  ) external {
    //avoid warning
    _allocPoint = 0;
    _withUpdate = true;
    poolInfo.push(
      PoolInfo({
        stakeToken: _stakeToken,
        allocPoint: 0,
        lastRewardBlock: 0,
        accMolePerShare: 0,
        accMolePerShareTilBonusEnd: 0
      })
    );
    poolLength = poolLength + 1;
  }

  // Deposit Staking tokens to FairLaunchToken for MOLE allocation.
  function deposit(
    address _for,
    uint256 _pid,
    uint256 _amount
  ) external override {
    //avoid warning
    _pid = 0;
    SafeToken.safeApprove(proxyToken, _for, _amount);
    proxyToken.safeTransferFrom(_for, address(this), _amount);
    SafeToken.safeApprove(proxyToken, _for, 0);
  }

  function withdraw(
    address _for,
    uint256 _pid,
    uint256 _amount
  ) external pure {
    //avoid warning
    _for = address(0);
    _pid = 0;
    _amount = 0;
    revert MockFairLaunch_NotImplemented();
  }

  function withdrawAll(address _for, uint256 _pid) external override {
    //avoid warning
    _pid = 0;

    if (proxyToken.myBalance() > 0) {
      SafeToken.safeApprove(proxyToken, _for, proxyToken.myBalance());
      proxyToken.safeTransfer(_for, proxyToken.myBalance());
      SafeToken.safeApprove(proxyToken, _for, 0);
    }
  }

  // Harvest MOLEs earn from the pool.
  function harvest(uint256 _pid) external override {
    //avoid warning
    _pid = 0;

    require(mockPendingMole <= mole.myBalance(), "not enough mole");
    SafeToken.safeApprove(mole, msg.sender, mockPendingMole);
    mole.safeTransfer(msg.sender, mockPendingMole);
    SafeToken.safeApprove(mole, msg.sender, 0);
  }
}
