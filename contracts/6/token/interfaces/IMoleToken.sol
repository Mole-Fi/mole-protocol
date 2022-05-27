// SPDX-License-Identifier: MIТ
pragma solidity 0.6.6;

interface IMoleToken {
  function transferAll(address _to) external;
  function lockOf(address _account) external view returns (uint256);
  function endReleaseBlock() external view returns (uint256);
  function unlock() external;
}
