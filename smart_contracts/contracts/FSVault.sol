// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol"; 


// The Vault allows users to top up Eth, FailSafeToken or any other ERC20 token
// Using custom errors throughout the contract to save gas
// Added Native FailSafeToken support, not shown on the dApp
contract FSVault is Context, ReentrancyGuard {

    // Native Fail Safe Token
    IERC20 public immutable FST;

    // User address => ERC20 token address => amount
    mapping (address => mapping (address => uint256)) public balancesErc20;
    mapping (address => uint256) public balancesEth;

    // Events
    event Erc20Deposit(address indexed user, address indexed erc20, uint256 amount, uint256 indexed time);
    event Erc20Withdraw(address  indexed user, address indexed erc20, uint256 amount, uint256 indexed time);
    event EthDeposit(address indexed user, uint256 amount, uint256 indexed time);
    event EthWithdraw(address  indexed user, uint256 amount, uint256 indexed time);

    // Using custom errors to save gas
    error InsufficientDepositAmount(uint256 balance, uint256 depositAmount);
    error InsufficientWithdrawAmount(uint256 availableToWithdraw, uint requestedAmount);
    error InsufficientAllowance(uint256 allowance, uint256 depositAmount);
    
    /**
     * @notice Constructor for initializing the contract with the address of the FailSafe Token (FST).
     * @param tokenAddress The address of the FailSafe Token contract.
     */
    constructor(address tokenAddress) {
        FST = IERC20(tokenAddress);
    }

    /**
     * @notice Allows users to deposit ETH into the contract
     * @dev Emits an EthDeposit event upon successful deposit
     */
    function depositEth() external payable {
        uint256 amount = msg.value;
        if (amount == 0) {
            revert InsufficientDepositAmount(balancesEth[_msgSender()], amount);
        }
        balancesEth[_msgSender()] += amount;

        emit EthDeposit(_msgSender(), amount, block.timestamp);
    }

    /**
     * @notice Function to deposit FailSafe native token
     * @param amount The amount of FailSafe native token to deposit
     */
    function depositFST(uint256 amount) external {
        _depositERC20(address(FST), amount);
    }

    /**
     * @notice Function to deposit any ERC20 token
     * @param tokenAddress The address of the ERC20 token to deposit
     * @param amount The amount of ERC20 token to deposit
     */
    function depositERC20(address tokenAddress, uint256 amount) external {
        // This function assumes the token address provided is for a valid ERC20 token contract
        _depositERC20(tokenAddress, amount);
    }

    /**
     * @notice Function to withdraw ETH from the contract
     * @param amount The amount of ETH to withdraw
     */
    function withdrawEth(uint256 amount) external {
        uint256 userBalance = balancesEth[_msgSender()];
        if (amount > userBalance) {
            revert InsufficientWithdrawAmount(userBalance, amount);
        }
        
        // Subtracting user balance
        balancesEth[_msgSender()] -= amount;
        payable(_msgSender()).transfer(amount);

        emit EthWithdraw(_msgSender(), amount, block.timestamp);
    }

    /**
     * @notice Function to withdraw FailSafe native token (FST)
     * @param amount The amount of FailSafe native token (FST) to withdraw
     */
    function withdrawFST(uint256 amount) external {
        _withdrawErc20(address(FST), amount);
    }

    /**
     * @notice Function to withdraw any ERC20 token
     * @param tokenAddress The address of the ERC20 token to withdraw
     * @param amount The amount of ERC20 token to withdraw
     */
    function withdrawErc20(address tokenAddress, uint256 amount) external {
        _withdrawErc20(tokenAddress, amount);
    }

    /**
     * @notice Internal function to deposit ERC20 tokens into the contract
     * @dev This function is internal and should only be called by other functions within the contract.
     * @param tokenAddress The address of the ERC20 token to deposit
     * @param amount The amount of ERC20 tokens to deposit
     */
    function _depositERC20 (address tokenAddress, uint256 amount) internal nonReentrant {
        // First thought to not validate anything 
        // as standard secure ERC20 code i.e. openzepplin validates it on its end
        // but as user can store any token now so we cannot be sure about validation checks
        // thats why putting validations here as well (no compromise on security)
        
        IERC20 erc20 = IERC20(tokenAddress);
        uint256 userBalance = erc20.balanceOf(_msgSender());
        uint256 allowance = erc20.allowance(_msgSender(), address(this));
        
        // Checks for user balance
        if (userBalance < amount) {
            revert InsufficientDepositAmount(userBalance, amount);
        }
        
        // Checks for allowance
        if (allowance < amount) {
            revert InsufficientAllowance(allowance, amount);
        }
        IERC20(tokenAddress).transferFrom(_msgSender(), address(this), amount);
        balancesErc20 [_msgSender()][tokenAddress] += amount;

        emit Erc20Deposit(_msgSender(), tokenAddress, amount, block.timestamp);
    }

    /**
     * @notice Internal function to withdraw ERC20 tokens from the contract
     * @dev This function is internal and should only be called by other functions within the contract.
     * @param tokenAddress The address of the ERC20 token to withdraw
     * @param amount The amount of ERC20 tokens to withdraw
     */
    function _withdrawErc20(address tokenAddress, uint256 amount) internal nonReentrant {
        uint256 userBalance = balancesErc20[_msgSender()][tokenAddress];
        if (amount > userBalance) {
            revert InsufficientWithdrawAmount(amount, userBalance);
        }

        // Subtract the withdrawal amount from the user's balance
        balancesErc20[_msgSender()][tokenAddress] -= amount;

        // Transfer tokens from the contract to the user
        IERC20(tokenAddress).transfer(_msgSender(), amount);

        emit Erc20Withdraw(_msgSender(), tokenAddress, amount, block.timestamp);    
    }

    // // users can deposit any kind of erc20
    // // users can deposit eth
    // function interfaceId() public pure returns(bytes4){
    //     return type(IERC20).interfaceId;
    // }
}