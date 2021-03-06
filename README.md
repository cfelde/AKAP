# AKAP

The [AKA protocol](https://akap.me) (AKAP) is an idea, a specification, and a set of smart contracts written for the Ethereum blockchain. It tackles a challenge seen on blockchains related to immutability and how you write code to handle such an environment.

In short the challenge facing blockchain developers is that when they deploy code others depend on, there's no easy upgrade path. The location of the code is tied in with the location of storage, and if you want to upgrade your code you can't easily take this storage with you. Deploying a new version would force everyone who depend on it to change their references, not to mention the pain of repopulating existing data.

Eternal storage is a pattern that AKAP can help you leverage, where the idea is to keep your storage separate from your code.

Please see the [documentation](https://akap.me/docs) for more in depth material.

## Repositories

This repository contains the AKAP and AKAF registry contracts. Other related repositories:

[AKAP utils](https://github.com/cfelde/AKAP-utils) <br/>
[AKAP docs](https://github.com/cfelde/AKAP-docs) <br/>
[AKAP browser](https://github.com/cfelde/AKAP-browser) <br/>
[Using AKAP](https://github.com/cfelde/Using-AKAP) <br/>

## Building locally with Truffle

Assuming you have [Truffle](https://www.trufflesuite.com/) installed
you can run the usual commands:

`git clone https://github.com/cfelde/AKAP.git`

`cd AKAP`

`truffle build`

`truffle test`

You might need to do:
 
`npm install @openzeppelin/contracts`
 
`npm install @openzeppelin/test-helpers`

## Using as a library

To use this as a library in your Solidity code, install with npm first:

`npm install akap`

If you need a local testnet instance of AKAP do:

`truffle deploy --network development`

You can find an example with further details on https://github.com/cfelde/Using-AKAP

## Official build

The "officially compiled" AKAP contract json files can be found under `build/contracts`.

This contract has been deployed to
[Goerli](https://goerli.etherscan.io/address/0xaaccaab0e85b1efcecdba88f4399fa6cab402349),
[Rinkeby](https://rinkeby.etherscan.io/address/0xaaccaab0e85b1efcecdba88f4399fa6cab402349),
[Kovan](https://kovan.etherscan.io/address/0xaaccaab0e85b1efcecdba88f4399fa6cab402349),
[Ropsten](https://ropsten.etherscan.io/address/0xaaccaab0e85b1efcecdba88f4399fa6cab402349) and of course
[Mainnet](https://etherscan.io/address/0xaaccaab0e85b1efcecdba88f4399fa6cab402349).

Contract address is: 0xaacCAAB0E85b1EfCEcdBA88F4399fa6CAb402349

Compiled using below versions:

```
Truffle v5.1.4 (core: 5.1.4)
Solidity v0.5.12 (solc-js)
Node v13.3.0
Web3.js v1.2.1
macOS Catalina v10.15.2
```

The solc optimizer was enabled with runs = 200.

## AKAP UI and apps

There's a browser available on [akap.me/browser](https://akap.me/browser), and you can find the repo for this [here](https://github.com/cfelde/AKAP-browser).
Also, if you want to see how you can get started using AKAP in your web apps, there's a simple [deploy test](https://github.com/cfelde/AKAP-deploy-test) example available.

We're building a list of apps and similar using AKAP. If you have some examples to share, please do.

[Redir.eth URL shortener](https://redir.eth), with [source code](https://github.com/mohamedelshami/AKAP-url-shortener).

[The Million DAI Website](https://milliondai.website)