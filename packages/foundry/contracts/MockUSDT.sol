pragma solidity ^0.8.21;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDT is ERC20 {
    constructor(address recipient) ERC20("USD Tether", "USDT") {
        _mint(recipient, 10000 * 10 ** 18);
    }

    function faucet(address recipient, uint256 amount) external {
        _mint(recipient, amount);
    }
}
