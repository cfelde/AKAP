# AKAP

The AKA protocol is somewhat like LDAP for Ethereum. It allows you to
reference content and data, and also navigate structures in the context
of nodes and a directed acyclic graph.

This project is at a draft/beta stage and we welcome contributions in
the form of feedback, comments, code review and test cases.

Please have a read of the [white paper](WHITEPAPER.md). While in draft
form pull requests are welcomed on any aspect of the white paper, from
simple spelling or sentence issues to more fundamental discussions on
the approach taken.

## Truffle commands

Assuming you have [Truffle](https://www.trufflesuite.com/) installed
you can run the usual commands:

`truffle build`

`truffle test`

You might need to do:
 
 `npm install @openzeppelin/contracts`
 
 `npm install @openzeppelin/test-helpers`

## Official build

The "officially compiled" AKAP contract json files can be found under `build/contracts`.

Compiled using below versions:

Truffle v5.1.4 (core: 5.1.4)
Solidity v0.5.12 (solc-js)
Node v13.3.0
Web3.js v1.2.1
macOS Catalina v10.15.2

The solc optimizer was enabled with runs = 200.