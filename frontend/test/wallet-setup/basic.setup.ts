import { MetaMask, defineWalletSetup } from '@synthetixio/synpress'

const SEED_PHRASE = 'pear miracle song tone photo audit night luxury surge miss cable choice'
const PASSWORD = 'qwert12345'

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  const metamask = new MetaMask(context, walletPage, PASSWORD)

  await metamask.importWallet(SEED_PHRASE)
})