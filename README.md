# EthProps
Ethereum implementation of props app. Currently working on the Rinkeby test network.

## How to use
1. Install [MetaMask Chrome Plugin](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en)
2. In MetaMask create new account and switch to the Rinkeby Test Net
3. Use [faucet.rinkeby.io](https://faucet.rinkeby.io/) to get yourself some ether in Rinkeby network
4. Make sure that your account in MetaMask is unlocked and provide your passphrase if prompted
5. Visit [eth-props.surge.sh](http://eth-props.surge.sh/) or serve it locally (see [How to
   develop](#how-to-develop))
6. Go to registration section
7. Type your username, register and accept the operation in MetaMask popup window
8. Ask your friend to register and provide you with the username to send your first props!

## How to develop
1. First run `truffle compile`, then run `truffle migrate` to deploy the contracts onto your network of choice (default "development")
2. Then run `npm run dev` to build the app and serve it on http://localhost:8080
3. Run `npm run lint` to lint javascript and solidity files
