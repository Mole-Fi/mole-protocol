// SPDX-License-Identifier: MIT


pragma solidity 0.8.10;

interface IDeltaNeutralVaultConfig {
  function getWrappedNativeAddr() external view returns (address);

  function getWNativeRelayer() external view returns (address);

  function rebalanceFactor() external view returns (uint256);

  function positionValueTolerance() external view returns (uint256);

  function debtRatioTolerance() external view returns (uint256);

  /// @dev Return if the caller is whitelisted.
  function whitelistedCallers(address _caller) external view returns (bool);

  /// @dev Return if the caller is whitelisted.
  function whitelistedRebalancers(address _caller) external view returns (bool);

  /// @dev Return if the caller is exempted from fee.
  function feeExemptedCallers(address _caller) external returns (bool);

  /// @dev Get fairlaunch address.
  function fairLaunchAddr() external view returns (address);

  /// @dev Return the deposit fee treasury.
  function depositFeeTreasury() external view returns (address);

  /// @dev Get deposit fee.
  function depositFeeBps() external view returns (uint256);

  /// @dev Return the withdrawl fee treasury.
  function withdrawalFeeTreasury() external view returns (address);

  /// @dev Get withdrawal fee.
  function withdrawalFeeBps() external returns (uint256);

  /// @dev Return management fee treasury
  function managementFeeTreasury() external returns (address);

  /// @dev Return management fee per sec.
  function managementFeePerSec() external view returns (uint256);

  /// @dev Get leverage level.
  function leverageLevel() external view returns (uint8);

  /// @dev Return if the caller is whitelisted.
  function whitelistedReinvestors(address _caller) external view returns (bool);

  /// @dev Return MOLE reinvest fee treasury.
  function moleReinvestFeeTreasury() external view returns (address);

  /// @dev Return mole bounty bps.
  function moleBountyBps() external view returns (uint256);

  /// @dev Return MOLE beneficiary address.
  function moleBeneficiary() external view returns (address);

  /// @dev Return MOLE beneficiary bps.
  function moleBeneficiaryBps() external view returns (uint256);

  /// @dev Return if delta neutral vault position value acceptable.
  function isVaultSizeAcceptable(uint256 _totalPositionValue) external view returns (bool);

  /// @dev Return swap router
  function getSwapRouter() external view returns (address);

  /// @dev Return reinvest path
  function getReinvestPath() external view returns (address[] memory);
}
