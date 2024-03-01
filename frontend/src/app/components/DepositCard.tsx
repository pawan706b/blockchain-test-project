'use client'

import React, { useEffect, useState } from 'react'
import styles from "../styles/BlurCard.module.css"
import { type BaseError, useAccount, useBalance, useWriteContract, useReadContract, useBlockNumber, useWatchContractEvent } from 'wagmi'
import { FSTokenAbi, FSVaultABI } from '../constants/abi'
import { FSTokenAddress, FSVaultAddress } from '../constants/address'
import { ethers } from 'ethers'

const Deposit: React.FC = () => {
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
	const { error: errorERC20Approve, isPending: isPendingERC20Approve, writeContract: writeERC20Approve } = useWriteContract()

	// To update states on block updates
	const { data: blockNumber } = useBlockNumber({ watch: true }) 

	// Reading user's allowamce amount
	const { data: erc20Allowance, error: allowanceError, refetch: refetchAllowance } = useReadContract({
		address: erc20AddrInput,
		abi: FSTokenAbi,
		functionName: 'allowance',
		args: [userAddress, FSVaultAddress],
	})
	
	// Fetch ERC balance
	const { data: balanceErc, isError: isErrorErc, isLoading: isLoadingErc, refetch: refetchErc } = useBalance({
		address: userAddress,
		token: erc20AddrInput ? erc20AddrInput : "0x00",
	})

	// Fetch Eth balance
	const { data: balanceEth, isError: isErrorEth, isLoading: isLoadingEth, refetch: refetchEth } = useBalance({
		address: userAddress,
	})

	// Refetching ERC balance on Event
	// First thought to do it on the block number event but it would be very big overload
	// as it will fetch at every block.
	// Doing it on event change is efficient
	useWatchContractEvent({
		address: erc20AddrInput,
		abi: FSTokenAbi,
		eventName: 'Transfer',
		onLogs() {
			refetchErc()
			console.log("ERC20 balance changed")
		},
	  })

	// Refetch ERC balance if changed
	// Only refetching eth balance on new blocks
	useEffect(() => { 
		refetchEth()
	}, [blockNumber]) 

	// Refetching allowance
	useWatchContractEvent({
		address: erc20AddrInput,
		abi: FSTokenAbi,
		eventName: 'Approval',
		onLogs() {
			refetchAllowance()
			console.log("Allowance changed")
		},
	  })

	// Handling token type change
	const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedValue = event.target.value
		setSelectedOption(selectedValue)
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

	//Display user selected token balance
	function displayUserBalance() {
		if (selectedOption === "option1") {
			return <div>Balance: 0</div>
		}
		else if (selectedOption === "option3") {
			if (isLoadingErc) return <div>Loading...</div>
			else if (isErrorErc) return <div>Balance: 0</div>
			else return <div>Balance: {balanceErc?.value.toString()}</div>
		}
		else if (selectedOption === "option2") {
			if (isLoadingEth) return <div>Loading...</div>
			else if (isErrorEth) return <div>Error</div>
			else return <div>Balance: {balanceEth?.value.toString()}</div>
		}
	}

	// Deposit functionalty
	//Eth
	async function handleEth() {
		writeEth({
			address: FSVaultAddress,
			abi: FSVaultABI,
			functionName: "depositEth",
			value: ethers.parseEther(numberInput),
		})
	}

	//ERC20
	function handleErc20() {
		writeERC20({
			address: FSVaultAddress,
			abi: FSVaultABI,
			functionName: "depositERC20",
			args: [erc20AddrInput, ethers.parseEther(numberInput)],
		})
	}

	//ERC20
	async function handleApprove() {
		writeERC20Approve({
			address: erc20AddrInput,
			abi: FSTokenAbi,
			functionName: "approve",
			args: [FSVaultAddress, ethers.parseEther(numberInput)],
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

	function getError() {
		if (errorERC20) return <div className={styles.errorMessage}>Error: {(errorERC20 as BaseError).message || errorERC20.message}</div>
		if (errorEth) return <div className={styles.errorMessage}>Error: {(errorEth as BaseError).message || errorEth.message}</div>
		if (errorERC20Approve) return <div className={styles.errorMessage}>Error: {(errorERC20Approve as BaseError).message || errorERC20Approve.message}</div>
	}

	return (
		<div>
			<div className={styles.blurCard}>
				{displayUserBalance()}
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
				{showStringInput && (
					<input
						type="text"
						value={erc20AddrInput}
						onChange={handleStringInputChange}
						placeholder="ERC20 Address"
					/>
				)}
				{(showStringInput) &&
					<>
						<br />
						Allowance: {erc20Allowance?.toString() || 0}
						<br />
						<button disabled={isPendingERC20Approve} onClick={handleApprove}>
							{isPendingERC20Approve ? 'Approving...' : 'Approve'}
						</button>
					</>
				}
				{/* {showStringInput && (
				<button disabled={isPendingERC20Approve} onClick={handleApprove}>
					{isPendingERC20Approve ? 'Approving...' : 'Approve'}
				</button>
			)} */}
				<button disabled={isPendingEth || isPendingERC20} onClick={handleSelectedOption}>
					{isPendingERC20 || isPendingEth ? 'Depositing...' : 'Deposit'}
				</button>
				{getError()}

			</div>
		</div>

	)
}

export default Deposit