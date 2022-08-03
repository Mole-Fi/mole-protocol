// SPDX-License-Identifier: MIT
pragma solidity 0.6.6;

interface IVeJoeStaking {


    function deposit(uint256 _amount) external;

    function withdraw(uint256 _amount) external;

    function claim() external;

}
