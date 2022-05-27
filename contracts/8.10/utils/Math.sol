// SPDX-License-Identifier: MIT


pragma solidity 0.8.10;

library Math {
  /**
   * @dev Check if two values are almost equal within toleranceBps.
   */
  function almostEqual(
    uint256 value0,
    uint256 value1,
    uint256 toleranceBps
  ) internal pure returns (bool) {
    uint256 maxValue = max(value0, value1);
    return ((maxValue - min(value0, value1)) * 10000) <= toleranceBps * maxValue;
  }

  /**
   * @dev Returns the largest of two numbers.
   */
  function max(uint256 a, uint256 b) internal pure returns (uint256) {
    return a >= b ? a : b;
  }

  /**
   * @dev Returns the smallest of two numbers.
   */
  function min(uint256 a, uint256 b) internal pure returns (uint256) {
    return a < b ? a : b;
  }

  /**
   * @dev Returns the rounded number.
   */
  function e36round(uint256 a) internal pure returns (uint256) {
    return (a + 5e17) / 1e18;
  }
}
