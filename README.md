# EthProps
Ethereum implementation of props app. Currently working on the Rinkeby test network.

## How to use
1. Install [MetaMask Chrome Plugin](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en)
2. In MetaMask create new account and switch to the Rinkeby Test Net
3. Use https://faucet.rinkeby.io/ to get yourself some ether in Rinkeby network
4. Visit http://eth-props.surge.sh/
5. Unlock your account in MetaMask by providing your passphrase
6. Go to registration section
7. Type your username, register and accept the operation in MetaMask popup window
8. Ask your friend to register and provide you with the username to send your first props!

## How to develop
1. First run `truffle compile`, then run `truffle migrate` to deploy the contracts onto your network of choice (default "development").
2. Then run `npm run dev` to build the app and serve it on http://localhost:8080

## TODO
* Tests in .sol language
