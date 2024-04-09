import { MetaMask, defineWalletSetup, getExtensionId } from '@synthetixio/synpress'

const SEED_PHRASE = 'pear miracle song tone photo audit night luxury surge miss cable choice'
const PASSWORD = 'qwert12345'
const CUSTOM_NETWORK = ({
    name: 'Mumbai',
    rpcUrl: 'https://rpc-mumbai.polygon.technology',
    chainId: 80001,
    symbol:'MATIC',
    blockExplorerUrl: 'https://mumbai.polygonscan.com/'
  })
const WEBSITE = 'http://172.27.96.1:3000/'
  

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  // This is a workaround for the fact that the MetaMask extension ID changes.
  // This workaround won't be needed in the near future! 😁
  const extensionId = await getExtensionId(context, 'MetaMask')
  const metamask = new MetaMask(context, walletPage, PASSWORD, extensionId)

  await metamask.importWallet(SEED_PHRASE)

  const page = await context.newPage()

  // Go to a locally hosted MetaMask Test Dapp.
//   await page.goto('http://localhost:3000')
  await page.goto(WEBSITE);


// await page.locator('#connect-button').click()
  await page.click('text=Connect Wallet');
  await page.click('text=MetaMask');

  await metamask.connectToDapp(['Account 1'])

//   // Add mumbai testnet
//   await metamask.addNetwork(CUSTOM_NETWORK)
//   await metamask.switchNetwork(CUSTOM_NETWORK.name)
})