# Instructions

The idea is to pass a single statement, and this same statement is written to a table X number of times. You specifiy a "choice" for `sdk` or `direct`, then number of `runs`, and the `statement` itself. Once the data is written using the specified choice, the output data is written to a table called `compare_results_80001_2028` with allow-all write access.

## Setup

1. `npm install`
2. In the `.env` file, provide a `PRIVATE_KEY` and `ALCHEMY_POLYGON_MUMBAI_API_KEY`

## Usage

Run the following, which writes to an allow-all-inserts table `compare_results_80001_2028`:

```shell
node index.js <choice> <runs> <statment>
```

- `choice`: Either `sdk` or `direct`
- `runs`: The number of runs to perform (this writes the same query X # runs, as separate txs)
- `statement`: A write query statement

## Examples

Make a `write` call with the SDK 1 time, which logs the total elapsed time.

```shell
> node index.js sdk 1 "insert into acl_80001_2010 (name) values ('sdk')"
Using SDK
_________
Run #1: 12.732 seconds

Writing to the results table...
https://mumbai.polygonscan.com/tx/0x61fe0475cc0e5fa69e1e77acda97cd315099731afb5744aa923d9d5aa394f19d
```

Or, make a `runSQL` call with a direct `TablelandTables` smart contract connection, also logging information:

```shell
> node index.js direct 1 "insert into acl_80001_2010 (name) values ('direct')"
Using direct
____________
Run #1: 11.152 seconds

Writing to the results table...
https://mumbai.polygonscan.com/tx/0x984c24966b538c4f659d58d8a55772eaff491d40e95c473bc8c85d7e8795ac50
```

And lastly, view the results from the runs here: [compare_results table query](https://testnet.tableland.network/query?s=select%20*%20from%20compare_results_80001_2028)
