const Wallet = artifacts.require("Wallet");
const { expectRevert } = require("@openzeppelin/test-helpers");

contract("Wallet", (accounts) => {
  let wallet;

  beforeEach(async () => {
    wallet = await Wallet.new([accounts[0], accounts[1], accounts[2]], 2);
    await web3.eth.sendTransaction({
      from: accounts[0],
      to: wallet.address,
      value: 1000,
    });
  });

  it("should have the correct approvers and quorum", async () => {
    const approvers = await wallet.getApprovers();
    const quorum = await wallet.quorum();

    expect(approvers.length).to.equal(3);
    expect(approvers[0]).to.equal(accounts[0]);
    expect(approvers[1]).to.equal(accounts[1]);
    expect(approvers[2]).to.equal(accounts[2]);
    expect(quorum.toNumber()).to.equal(2);
  });

  describe("createTransfer", () => {
    it("should create transfers", async () => {
      await wallet.createTransfer(100, accounts[5], { from: accounts[0] });
      const transfers = await wallet.getTransfers();
      expect(transfers.length).to.equal(1);
      expect(transfers[0].id).to.equal("0");
      expect(transfers[0].amount).to.equal("100");
      expect(transfers[0].to).to.equal(accounts[5]);
      expect(transfers[0].approvals).to.equal("0");
      expect(transfers[0].sent).to.equal(false);
    });

    it("should not create transfers if sender is not approver", async () => {
      await expectRevert(
        wallet.createTransfer(100, accounts[5], { from: accounts[4] }),
        "only approver can approve"
      );
    });
  });
});
