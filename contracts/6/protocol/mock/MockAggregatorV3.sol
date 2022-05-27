  
pragma solidity 0.6.6;

import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";

contract MockAggregatorV3 {
  int256 public price;
  uint256 public updateAt;
  uint8 public decimals;
  string public description;
  uint256 public version;

  constructor(int256 _price, uint8 _decimals) public {
    price = _price;
    decimals = _decimals;
    updateAt = now;
  }

  function latestRoundData()
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    )
  {
    return (uint80(0), price, uint256(0), updateAt, uint80(0));
  }
}
