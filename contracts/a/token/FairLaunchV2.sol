  
pragma solidity 0.6.6;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./interfaces/IFairLaunchV1.sol";
import "./interfaces/ILocker.sol";

/// @notice The (older) FairLaunch contract lock and vest mechanic embeded in MoleToken
/// Hence to make the protocol to be able to adjust those lock and vest mechanic we need FairLaunchV2
/// However, FairLaunch is the only owner with the right to mint MoleToken,
/// therefore newly minted Mole will go out from FairLaunch but then FairLaunchV2 will be the only one
/// that own and stake a dummy token on FairLaunch contract. Allocation point of every pools on FairLaunchV1 must
/// be changed to '0' and all pools must be migrate to FairLaunchV2
contract FairLaunchV2 is Ownable, ReentrancyGuard {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  // Info of each user.
  struct UserInfo {
    uint256 amount; // How many Staking tokens the user has provided.
    uint256 rewardDebt; // Reward debt. See explanation below.
    address fundedBy; // Funded by who?
  }

  // Info of each pool.
  struct PoolInfo {
    uint256 allocPoint; // How many allocation points assigned to this pool. MOLEs to distribute per block.
    uint256 lastRewardBlock; // Last block number that MOLEs distribution occurs.
    uint256 accMolePerShare; // Accumulated MOLEs per share, times 1e12. See below.
  }

  /// @notice Address of FairLaunchV1.
  IFairLaunchV1 public immutable FAIR_LAUNCH_V1;
  /// @notice The MOLE ERC-20 contract.
  IERC20 public immutable MOLE;
  /// @notice The index of the master pool.
  uint256 public immutable MASTER_PID;

  /// @notice Info of each pool.
  PoolInfo[] public poolInfo;
  /// @notice Address of the ERC-20 for each Pool.
  IERC20[] public stakeTokens;
  /// @notice Address of each `ILockers` contract.
  ILocker[] public lockers;
  /// @notice DummyToken
  IERC20 public dummyToken;

  /// @notice Info of each user that stakes tokens.
  mapping(uint256 => mapping(address => UserInfo)) public userInfo;
  /// @dev Total allocation points. Must be the sum of all allocation points in all pools.
  uint256 totalAllocPoint;

  uint256 private constant ACC_MOLE_PRECISION = 1e12;

  event Deposit(address indexed user, uint256 indexed pid, uint256 amount, address indexed to);
  event Withdraw(address indexed user, uint256 indexed pid, uint256 amount, address indexed to);
  event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount, address indexed to);
  event Harvest(address indexed user, uint256 indexed pid, uint256 amount);
  event LogPoolAddition(uint256 indexed pid, uint256 allocPoint, IERC20 indexed lpToken, ILocker indexed rewarder);
  event LogSetPool(uint256 indexed pid, uint256 allocPoint, ILocker rewarder, bool overwrite);
  event LogUpdatePool(uint256 indexed pid, uint256 lastRewardBlock, uint256 lpSupply, uint256 accMolePerShare);
  event LogInit();

  /// @notice Harvests MOLE from `FAIR_LAUNCH` and pool `MASTER_PID` to this contract.
  modifier harvestFromFairLaunchV1() {
    FAIR_LAUNCH_V1.deposit(address(this), MASTER_PID, 0);
    _;
  }

  /// @param _FAIR_LAUNCH_V1 the FairLaunch contract
  /// @param _mole the MOLE Token
  /// @param _MASTER_PID the pool ID of the dummy token on the base contract
  constructor(
    IFairLaunchV1 _FAIR_LAUNCH_V1,
    IERC20 _mole,
    uint256 _MASTER_PID
  ) public {
    FAIR_LAUNCH_V1 = _FAIR_LAUNCH_V1;
    MOLE = _mole;
    MASTER_PID = _MASTER_PID;
  }

  /// @notice Deposits a dummy tokens to `FAIR_LAUNCH`.
  /// This is required because `FAIR_LAUNCH` holds the minting rights for MOLE.
  /// Any balance of transaction sender from `dummyToken` is transferred.
  function init(IERC20 _dummyToken) external onlyOwner {
    dummyToken = _dummyToken;
    uint256 balance = dummyToken.balanceOf(msg.sender);
    dummyToken.safeTransferFrom(msg.sender, address(this), balance);
    dummyToken.safeApprove(address(FAIR_LAUNCH_V1), balance);
    FAIR_LAUNCH_V1.deposit(address(this), MASTER_PID, balance);
    emit LogInit();
  }

  /// @notice Returns the number of pools.
  function poolLength() external view returns (uint256) {
    return poolInfo.length;
  }

  /// @notice Returns if stakeToken is duplicated
  function isDuplicatedPool(IERC20 _stakeToken) public view returns (bool) {
    uint256 length = poolInfo.length;
    for (uint256 _pid = 0; _pid < length; _pid++) {
      if (stakeTokens[_pid] == _stakeToken) return true;
    }
    return false;
  }

  /// @notice Add a new lp to the pool. Can only be called by the owner.
  /// DO NOT add the same LP token more than once. Rewards will be messed up if you do.
  /// @param allocPoint AP of the new pool
  /// @param _stakeToken address of the LP token
  /// @param _locker address of the reward Contract
  function addPool(
    uint256 allocPoint,
    IERC20 _stakeToken,
    ILocker _locker,
    uint256 _startBlock
  ) external onlyOwner {
    require(!isDuplicatedPool(_stakeToken), "FairLaunchV2::addPool:: stakeToken dup");

    uint256 lastRewardBlock = block.number > _startBlock ? block.number : _startBlock;
    totalAllocPoint = totalAllocPoint.add(allocPoint);

    stakeTokens.push(_stakeToken);
    lockers.push(_locker);

    poolInfo.push(PoolInfo({ allocPoint: allocPoint, lastRewardBlock: lastRewardBlock, accMolePerShare: 0 }));
    emit LogPoolAddition(stakeTokens.length.sub(1), allocPoint, _stakeToken, _locker);
  }

  /// @notice Update the given pool's MOLE allocation point and `ILocker` contract. Can only be called by the owner.
  /// @param _pid The index of the pool. See `poolInfo`.
  /// @param _allocPoint new AP of the pool
  /// @param _locker Address of the rewarder delegate.
  /// @param overwrite True if _locker should be `set`. Otherwise `_locker` is ignored.
  function setPool(
    uint256 _pid,
    uint256 _allocPoint,
    ILocker _locker,
    bool overwrite
  ) external onlyOwner {
    updatePool(_pid);
    totalAllocPoint = totalAllocPoint.sub(poolInfo[_pid].allocPoint).add(_allocPoint);
    poolInfo[_pid].allocPoint = _allocPoint;
    if (overwrite) {
      lockers[_pid] = _locker;
    }
    emit LogSetPool(_pid, _allocPoint, overwrite ? _locker : lockers[_pid], overwrite);
  }

  /// @notice View function to see pending MOLEs on frontend.
  /// @param _pid The index of the pool. See `poolInfo`.
  /// @param _user address of user
  function pendingMole(uint256 _pid, address _user) external view returns (uint256) {
    PoolInfo memory pool = poolInfo[_pid];
    UserInfo storage user = userInfo[_pid][_user];
    uint256 accMolePerShare = pool.accMolePerShare;
    uint256 stakeTokenSupply = stakeTokens[_pid].balanceOf(address(this));
    if (block.number > pool.lastRewardBlock && stakeTokenSupply != 0) {
      uint256 blocks = block.number.sub(pool.lastRewardBlock);
      uint256 moleReward = blocks.mul(molePerBlock()).mul(pool.allocPoint).mul(ACC_MOLE_PRECISION).div(
        totalAllocPoint
      );
      accMolePerShare = accMolePerShare.add(moleReward.div(stakeTokenSupply));
    }
    uint256 _pendingMole = (user.amount.mul(accMolePerShare) / ACC_MOLE_PRECISION).sub(user.rewardDebt);
    return _pendingMole;
  }

  /// @notice Update reward variables for all pools. Be careful of gas spending!
  /// @param pids pool IDs of all to be updated, make sure to update all active pools
  function massUpdatePools(uint256[] calldata pids) external {
    uint256 len = pids.length;
    for (uint256 i = 0; i < len; ++i) {
      updatePool(pids[i]);
    }
  }

  /// @notice calculates the `amount` of MOLE per block
  function molePerBlock() public view returns (uint256 amount) {
    amount =
      uint256(FAIR_LAUNCH_V1.molePerBlock()).mul(FAIR_LAUNCH_V1.poolInfo(MASTER_PID).allocPoint) /
      FAIR_LAUNCH_V1.totalAllocPoint();
  }

  /// @notice Update reward variables of the given pool.
  /// @param pid The index of the pool. See `poolInfo`.
  /// @return pool returns the Pool that was updated
  function updatePool(uint256 pid) public harvestFromFairLaunchV1 returns (PoolInfo memory pool) {
    pool = poolInfo[pid];
    if (block.number > pool.lastRewardBlock) {
      uint256 stakeTokenSupply = stakeTokens[pid].balanceOf(address(this));
      if (stakeTokenSupply > 0 && totalAllocPoint > 0) {
        uint256 blocks = block.number.sub(pool.lastRewardBlock);
        uint256 moleReward = blocks.mul(molePerBlock()).mul(pool.allocPoint).mul(ACC_MOLE_PRECISION).div(
          totalAllocPoint
        );
        pool.accMolePerShare = pool.accMolePerShare.add((moleReward.div(stakeTokenSupply)));
      }
      pool.lastRewardBlock = block.number;
      poolInfo[pid] = pool;
      emit LogUpdatePool(pid, pool.lastRewardBlock, stakeTokenSupply, pool.accMolePerShare);
    }
  }

  /// @notice Deposit LP tokens to MasterChef for MOLE allocation.
  /// @param _for The address that will get yield
  /// @param pid The index of the pool. See `poolInfo`.
  /// @param amount to deposit.
  function deposit(
    address _for,
    uint256 pid,
    uint256 amount
  ) external harvestFromFairLaunchV1 nonReentrant {
    PoolInfo memory pool = updatePool(pid);
    UserInfo storage user = userInfo[pid][_for];

    // Validation
    if (user.fundedBy != address(0)) require(user.fundedBy == msg.sender, "FairLaunchV2::deposit:: bad sof");

    // Effects
    user.amount = user.amount.add(amount);
    user.rewardDebt = user.rewardDebt.add(amount.mul(pool.accMolePerShare) / ACC_MOLE_PRECISION);
    if (user.fundedBy == address(0)) user.fundedBy = msg.sender;

    // Interactions
    stakeTokens[pid].safeTransferFrom(address(msg.sender), address(this), amount);

    emit Deposit(msg.sender, pid, amount, _for);
  }

  /// @notice Withdraw LP tokens from MasterChef.
  /// @param _for Receiver of yield
  /// @param pid The index of the pool. See `poolInfo`.
  /// @param amount of lp tokens to withdraw.
  function withdraw(
    address _for,
    uint256 pid,
    uint256 amount
  ) external nonReentrant {
    PoolInfo memory pool = updatePool(pid);
    UserInfo storage user = userInfo[pid][_for];

    require(user.fundedBy == msg.sender, "FairLaunchV2::withdraw:: only funder");
    require(user.amount >= amount, "FairLaunchV2::withdraw:: not good");

    // Effects
    _harvest(_for, pid);

    user.rewardDebt = user.rewardDebt.sub(amount.mul(pool.accMolePerShare) / ACC_MOLE_PRECISION);
    user.amount = user.amount.sub(amount);
    if (user.amount == 0) user.fundedBy = address(0);

    // Interactions
    stakeTokens[pid].safeTransfer(msg.sender, amount);

    emit Withdraw(msg.sender, pid, amount, _for);
  }

  // Harvest MOLEs earn from the pool.
  function harvest(uint256 _pid) external {
    updatePool(_pid);
    _harvest(msg.sender, _pid);
  }

  /// @notice Harvest proceeds for transaction sender to `to`.
  /// @param pid The index of the pool. See `poolInfo`.
  /// @param to Receiver of MOLE rewards.
  function _harvest(address to, uint256 pid) internal harvestFromFairLaunchV1 {
    PoolInfo memory pool = poolInfo[pid];
    UserInfo storage user = userInfo[pid][to];
    uint256 accumulatedMole = user.amount.mul(pool.accMolePerShare).div(ACC_MOLE_PRECISION);
    uint256 _pendingMole = accumulatedMole.sub(user.rewardDebt);
    if (_pendingMole == 0) {
      return;
    }

    require(_pendingMole <= MOLE.balanceOf(address(this)), "FairLaunchV2::_harvest:: wtf not enough mole");

    // Effects
    user.rewardDebt = accumulatedMole;

    // Interactions
    ILocker _locker = lockers[pid];
    if (address(_locker) != address(0)) {
      uint256 lockAmount = _locker.calLockAmount(_pendingMole);
      MOLE.safeApprove(address(_locker), lockAmount);
      _locker.lock(to, lockAmount);
      _pendingMole = _pendingMole.sub(lockAmount);
      MOLE.safeApprove(address(_locker), 0);
    }

    MOLE.safeTransfer(to, _pendingMole);

    emit Harvest(msg.sender, pid, _pendingMole);
  }

  /// @notice Withdraw without caring about rewards. EMERGENCY ONLY.
  /// @param pid The index of the pool. See `poolInfo`.
  /// @param to Receiver of the staking tokens.
  function emergencyWithdraw(uint256 pid, address to) external nonReentrant {
    UserInfo storage user = userInfo[pid][msg.sender];
    require(user.fundedBy == msg.sender, "FairLaunchV2::emergencyWithdraw:: only funder");
    uint256 amount = user.amount;
    user.amount = 0;
    user.rewardDebt = 0;
    user.fundedBy = address(0);
    // Note: transfer can fail or succeed if `amount` is zero.
    stakeTokens[pid].safeTransfer(to, amount);
    emit EmergencyWithdraw(msg.sender, pid, amount, to);
  }
}
