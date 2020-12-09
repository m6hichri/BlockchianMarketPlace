const Marketplace = artifacts.require('./MarketplaceImb.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('MarketPlaceImb', ([deployer, seller, buyer]) => {
  let marketplace

  before(async () => {
    marketplace = await Marketplace.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await marketplace.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await marketplace.name()
      assert.equal(name, 'Market-Place Immobilieres')
    })
  })

  describe('immobilière', async () => {
    let result, immobiliereCount

    before(async () => {
      result = await marketplace.createImb('Maison', web3.utils.toWei('1', 'Ether'), { from: seller })
      immobiliereCount = await marketplace.immobiliereCount()
    })

    it('create immobilière ', async () => {
      // SUCCESS
      assert.equal(immobiliereCount, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), immobiliereCount.toNumber(), 'id is correct')
      assert.equal(event.name, 'Maison', 'name is correct')
      assert.equal(event.price, '1000000000000000000', 'price is correct')
      assert.equal(event.owner, seller, 'owner is correct')
      assert.equal(event.purchased, false, 'purchased is correct')
      await await marketplace.createImb('', web3.utils.toWei('1', 'Ether'), { from: seller }).should.be.rejected;
      await await marketplace.createImb('Maison', 0, { from: seller }).should.be.rejected;
    })
  })
})

