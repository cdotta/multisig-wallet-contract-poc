const Wallet = artifacts.require('Wallet');

module.exports = async function (
  deployer,
  _network,
  [account1, account2, account3],
) {
  await deployer.deploy(Wallet, [account1, account2, account3], 2);
  const wallet = await Wallet.deployed();
  await web3.eth.sendTransaction({
    from: account1,
    to: wallet.address,
    value: 10000,
  });
};
