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

## Sample results

```
Using direct

---

Run #1: 11.152 seconds
Run #2: 9.737 seconds
Run #3: 10.104 seconds
Run #4: 10.060 seconds
Run #5: 9.872 seconds
Run #6: 9.421 seconds
Run #7: 10.011 seconds
Run #8: 9.636 seconds
Run #9: 14.497 seconds
Run #10: 14.033 seconds
Run #11: 14.010 seconds
Run #12: 9.994 seconds
Run #13: 9.486 seconds
Run #14: 9.889 seconds
Run #15: 9.750 seconds

Using SDK

---

Run #1: 12.732 seconds
Run #2: 24.378 seconds
Run #3: 24.239 seconds
Run #4: 24.233 seconds
Run #5: 24.090 seconds
Run #6: 23.963 seconds
Run #7: 24.023 seconds
Run #8: 23.987 seconds
Run #9: 24.152 seconds
Run #10: 11.838 seconds
Run #11: 23.983 seconds
Run #12: 24.181 seconds
Run #13: 23.775 seconds
Run #14: 24.742 seconds
Run #15: 23.899 seconds
```
