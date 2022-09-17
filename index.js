import dotenv from "dotenv"
import { ethers, Wallet, providers } from "ethers"
import * as FS from "fs"
import { connect } from "@tableland/sdk"
dotenv.config()

async function main() {
	const fs = FS.promises
	const args = process.argv.slice(2)

	const privateKey = process.env.PRIVATE_KEY
	const alchemyMumbaiKey = process.env.ALCHEMY_POLYGON_MUMBAI_API_KEY
	const provider = new providers.AlchemyProvider("maticmum", alchemyMumbaiKey)
	const wallet = new Wallet(privateKey)
	const signer = wallet.connect(provider)
	const { chainId } = await provider.getNetwork()

	const tableland = await connect({ signer, network: "testnet", chain: "polygon-mumbai" })

	const choice = args[0]
	const runs = args[1]
	const statement = args[2]
	let tableName
	const queryType = statement.split(" ")[0]
	switch (queryType) {
		case "insert":
		case "delete":
			tableName = statement.split(" ")[2]
			break
		case "update":
			tableName = statement.split(" ")[1]
			break
		default:
			throw new Error("Invalid statement: could not parse table name")
	}
	const tableId = tableName.split("_").pop()
	const compareResultsTable = "compare_results_80001_2028" // Used to track the elapsed time data
	let results = ""
	let startTime
	let elapsed
	let elapsedSeconds
	switch (choice) {
		case "sdk":
			console.log(`Using SDK\n_________`)
			for (let i = 1; i <= runs; i++) {
				startTime = process.hrtime()
				const write = await tableland.write(statement)

				elapsed = process.hrtime(startTime)
				elapsedSeconds = (elapsed[0] + elapsed[1] / 1e9).toFixed(3)
				results += `insert into ${compareResultsTable} (choice,time,tx) values ('${choice}','${elapsedSeconds}','${write.hash}');`
				console.log(`Run #${i}: ${elapsedSeconds} seconds`)
			}
			break
		case "direct":
			console.log(`Using direct\n____________`)
			const tblAddress = await tableland.options.contract
			const tblAbiData = await fs.readFile("./abi.json") // The `TablelandTables` ABI JSON file
			const tblAbi = await JSON.parse(tblAbiData)
			const tbl = new ethers.Contract(tblAddress, tblAbi, signer)

			for (let i = 1; i <= runs; i++) {
				startTime = process.hrtime()
				const gasPrice = await provider.getGasPrice()
				const estimatedGasLimit = await tbl.estimateGas.runSQL(signer.address, tableId, statement)
				const approveTxUnsigned = await tbl.populateTransaction.runSQL(signer.address, tableId, statement)
				approveTxUnsigned.chainId = chainId
				approveTxUnsigned.gasLimit = estimatedGasLimit
				approveTxUnsigned.gasPrice = gasPrice
				approveTxUnsigned.nonce = await provider.getTransactionCount(signer.address)

				const approveTxSigned = await signer.signTransaction(approveTxUnsigned)
				const submittedTx = await provider.sendTransaction(approveTxSigned)
				const approveReceipt = await submittedTx.wait()
				if (approveReceipt.status === 0) throw new Error("Approve transaction failed")
				const txHash = submittedTx.hash

				elapsed = process.hrtime(startTime)
				elapsedSeconds = (elapsed[0] + elapsed[1] / 1e9).toFixed(3)
				results += `insert into ${compareResultsTable} (choice,time,tx) values ('${choice}','${elapsedSeconds}','${txHash}');`
				console.log(`Run #${i}: ${elapsedSeconds} seconds`)
			}
			break

		default:
			console.log("Please specify 'sdk' or 'direct'")
			break
	}

	console.log(`\nWriting to the compare_results table...`)
	const writeCompareResults = await tableland.write(results)
	console.log(`https://mumbai.polygonscan.com/tx/${writeCompareResults.hash}`)
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
