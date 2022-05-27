// SPDX-License-Identifier: MIT


pragma solidity 0.8.10;

interface IProxyToken {
  function setOkHolders(address[] calldata _okHolders, bool _isOk) external;

  function mint(address _to, uint256 _amount) external;

  function burn(address _from, uint256 _amount) external;
}
