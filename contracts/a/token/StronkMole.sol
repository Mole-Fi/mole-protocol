pragma solidity 0.6.6;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IMoleToken.sol";
import "./interfaces/IStronkMole.sol";
import "./StronkMoleRelayer.sol";
import "../utils/SafeToken.sol";

// StrongHodl is a smart contract for MOLE time-locking by asking user to lock MOLE for a period of time.
contract StronkMole is IStronkMole, ERC20("Stronk Mole", "sMOLE"), ReentrancyGuard {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  //Block number when locked MOLE can be turned to sMOLE
  uint256 public hodlableStartBlock;

  // Block number when locked MOLE can be turned to sMOLE
  uint256 public hodlableEndBlock;

  // Block number when MOLE can be released.
  uint256 public lockEndBlock;

  // Mole address
  address public moleTokenAddress;

  // To track the portion of each user Mole
  mapping(address => address) private _userRelayerMap;

  // events
  event PrepareHodl(address indexed user, address indexed relayer);
  event Hodl(address indexed user, address indexed relayer, uint256 receivingStronkMoleAmount);
  event Unhodl(address indexed user, uint256 receivingMoleAmount);

  constructor(
    address _moleAddress,
    uint256 _hodlableStartBlock,
    uint256 _hodlableEndBlock,
    uint256 _lockEndBlock
  ) public {
    _setupDecimals(18);
    moleTokenAddress = _moleAddress;
    hodlableStartBlock = _hodlableStartBlock;
    hodlableEndBlock = _hodlableEndBlock;
    lockEndBlock = _lockEndBlock;
  }

  /// @dev Require that the caller must be an EOA account to avoid flash loans.
  modifier onlyEOA() {
    require(msg.sender == tx.origin, "StronkMole::onlyEOA:: not eoa");
    _;
  }

  function prepareHodl() external override onlyEOA nonReentrant {
    require(_userRelayerMap[msg.sender] == address(0), "StronkMole::prepareHodl: user has already prepared hodl");
    require(block.number >= hodlableStartBlock, "StronkMole::prepareHodl: block.number not reach hodlableStartBlock");
    require(block.number < hodlableEndBlock, "StronkMole::prepareHodl: block.number exceeds hodlableEndBlock");
    require(IMoleToken(moleTokenAddress).lockOf(msg.sender) > 0, "StronkMole::preparehodl: user's lockMole must be greater than zero");

    // create relayer contract
    StronkMoleRelayer relayer = new StronkMoleRelayer(moleTokenAddress, msg.sender);
    _userRelayerMap[msg.sender] = address(relayer);
    emit PrepareHodl(msg.sender, address(relayer));
  }

  function hodl() external override onlyEOA nonReentrant {
    address relayerAddress = _userRelayerMap[msg.sender];

    require(relayerAddress != address(0), "StronkMole::hodl: user has not preapare hodl yet");

    uint256 relayerMoleLockedBalance = IMoleToken(moleTokenAddress).lockOf(relayerAddress);
    StronkMoleRelayer relayer = StronkMoleRelayer(relayerAddress);

    relayer.transferAllMole();
    _mint(msg.sender, relayerMoleLockedBalance);
    emit Hodl(msg.sender, address(relayer), relayerMoleLockedBalance);
  }

  function unhodl() external override onlyEOA nonReentrant {
    require(
      block.number > IMoleToken(moleTokenAddress).endReleaseBlock(),
      "StronkMole::unhodl: block.number have not reach moleToken.endReleaseBlock"
    );
    require(block.number > lockEndBlock, "StronkMole::unhodl: block.number have not reach lockEndBlock");

    // unlock all the Mole token in case it never have been unlocked yet
    // Note: given that releasePeriodEnd has passed, so that locked token has been 100% released
    if (IMoleToken(moleTokenAddress).lockOf(address(this)) > 0) {
      IMoleToken(moleTokenAddress).unlock();
    }

    uint256 userStronkMoleBalance = balanceOf(msg.sender);
    // Transfer all userStronkMoleBalance to StronkContract and then burn
    SafeERC20.safeTransferFrom(IERC20(address(this)), msg.sender, address(this), userStronkMoleBalance);
    // StronkMole burns all user's StronkMole
    _burn(address(this), userStronkMoleBalance);

    // transfer Mole from Strong Mole to user
    SafeERC20.safeTransfer(IERC20(moleTokenAddress), msg.sender, userStronkMoleBalance);

    emit Unhodl(msg.sender, userStronkMoleBalance);
  }

  function getRelayerAddress(address _account) external view returns (address) {
    return _userRelayerMap[_account];
  }
}
