'use client'

import React, { useState } from 'react'
import styles from "../styles/BlurCard.module.css"
import { type BaseError, useAccount, useWriteContract, useReadContracts } from 'wagmi'
import { FSVaultABI } from '../constants/abi'
import { FSVaultAddress } from '../constants/address'
import { ethers } from 'ethers'

const WithdrawCard: React.FC = () => {
	const { address: userAddress } = useAccount()	// User Address

	// Selecting coin
	const [selectedOption, setSelectedOption] = useState<string>('option1')
	const [showStringInput, setShowStringInput] = useState<boolean>(false)
	const [erc20AddrInput, setErc20AddrInput] = useState<any>()

	// Deposit amount input
	const [numberInput, setNumberInput] = useState<string>('')

	// Deposit contract wites
	const { error: errorEth, isPending: isPendingEth, writeContract: writeEth } = useWriteContract()
	const { error: errorERC20, isPending: isPendingERC20, writeContract: writeERC20 } = useWriteContract()

	// Reading user's deposited amount (both eth and ERC20)
	const { data: depositedData, error: depositedError, isPending: depositedPending } = useReadContracts({
		contracts: [{
			address: FSVaultAddress,
			abi: FSVaultABI,
			functionName: 'balancesErc20',
			args: [userAddress, erc20AddrInput],
		}, {
			address: FSVaultAddress,
			abi: FSVaultABI,
			functionName: 'balancesEth',
			args: [userAddress],
		}]
	})
	// Destructuring
	const [balanceErc20, balanceEth] = depositedData || []

	// Function to get deposited balance of user addresse
	function getDepositedBalance() {
		
		// Render loading state
		if (depositedPending) return <div>Loading...</div>
		
		// Render error if any
		if (depositedError)
			return (
				<div>
					Error: {(depositedError as BaseError).shortMessage || depositedError.message}
				</div>
			)
		// If selected option is Eth
		if (selectedOption === "option2") {
			return <div>Balance: {balanceEth?.result?.toString()}</div>
		}
		// If selected option is ERC20 token
		else if (selectedOption === "option3") {
			return <div>Balance: {balanceErc20?.result?.toString()}</div>
		}
	}

	// Handling token type change
	const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		
		// Getting selected value from frontend
		const selectedValue = event.target.value
		
		// Setting the value
		setSelectedOption(selectedValue)

		// Show Erc20 address field if selected
		if (selectedValue === "option3") {
			setShowStringInput(true)
		} else {
			setShowStringInput(false)
		}
	}

	// Handle user token address input
	const handleStringInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setErc20AddrInput(event.target.value)
	}

	// Handle deposit amount input change
	const handleNumberInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setNumberInput(event.target.value)
	}

	// Withdraw contract write hooks
	// Eth
	function handleEth() {
		writeEth({
			address: FSVaultAddress,
			abi: FSVaultABI,
			functionName: "withdrawEth",
			args: [ethers.parseEther(numberInput)],
		})
	}

	// ERC20
	function handleErc20() {
		writeERC20({
			address: FSVaultAddress,
			abi: FSVaultABI,
			functionName: "withdrawErc20",
			args: [erc20AddrInput, ethers.parseEther(numberInput)],
		})
	}

	// Handle selected deposit token	
	function handleSelectedOption() {
		if (selectedOption === "option2") {
			handleEth()
		}
		else if (selectedOption === "option3") {
			handleErc20()
		}
	}

	// Function to print errors
	function getError() {
		if (errorERC20) return <div className={styles.errorMessage}>Error: {(errorERC20 as BaseError).message || errorERC20.message}</div>
		if (errorEth) return <div className={styles.errorMessage}>Error: {(errorEth as BaseError).message || errorEth.message}</div>
	}

	return (
		<div>
			<div className={styles.blurCard}>
				
				{/* Show desposited balance of selected token type */}
				{getDepositedBalance()}

				{/* Token selection field */}
				<div className={styles.inputRow}>
					<select value={selectedOption} onChange={handleOptionChange}>
						<option value="option1">Select Token</option>
						<option value="option2">Eth</option>
						<option value="option3">ERC20</option>
					</select>
					<input
						type="number"
						value={numberInput}
						onChange={handleNumberInputChange}
						placeholder="Amount"
						min="0"
					/>
				</div>

				{/* If the option selected is ERC20 then show address input field */}
				{showStringInput && (
					<input
						type="text"
						value={erc20AddrInput}
						onChange={handleStringInputChange}
						placeholder="ERC20 Address"
					/>
				)}

				{/* Withdraw amount button */}
				<button disabled={isPendingEth || isPendingERC20} onClick={handleSelectedOption}>
					{isPendingERC20 || isPendingEth ? 'Withdrawing...' : 'Withdraw'}
				</button>

				{/* Display errors if any  */}
				{getError()}
			</div>
		</div>
	)
}

export default WithdrawCard
