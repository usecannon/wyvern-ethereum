/* global artifacts:false, it:false, contract:false, assert:false */

const WyvernExchange = artifacts.require('WyvernExchange')
const TestToken = artifacts.require('TestToken')
const DirectEscrowProvider = artifacts.require('DirectEscrowProvider')
// const BigNumber = require('bignumber.js')

const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider('http://localhost:8546')
const web3 = new Web3(provider)

contract('WyvernExchange', (accounts) => {
  it('should allow whitelisting token', () => {
    return TestToken
      .deployed()
      .then(tokenInstance => {
        return WyvernExchange
          .deployed()
          .then(exchangeInstance => {
            return exchangeInstance.modifyERC20Whitelist(tokenInstance.address, true)
              .then(() => {
                return exchangeInstance.erc20Whitelist.call(tokenInstance.address)
                  .then(ret => {
                    assert.equal(ret, true, 'Whitelist was not updated')
                  })
              })
          })
      })
  })

  it('should allow whitelisting escrow provider', () => {
    return DirectEscrowProvider
      .deployed()
      .then(escrowProviderInstance => {
        return WyvernExchange
          .deployed()
          .then(exchangeInstance => {
            return exchangeInstance.modifyEscrowProviderWhitelist(escrowProviderInstance.address, true)
              .then(() => {
                return exchangeInstance.escrowProviderWhitelist.call(escrowProviderInstance.address)
                  .then(ret => {
                    assert.equal(ret, true, 'Whitelist was not updated')
                  })
              })
          })
      })
  })

  it('should allow changing public beneficiary', () => {
    return WyvernExchange
      .deployed()
      .then(exchangeInstance => {
        return exchangeInstance.setPublicBeneficiary(exchangeInstance.address)
          .then(() => {
            return exchangeInstance.publicBeneficiary.call()
              .then(addr => {
                assert.equal(addr, exchangeInstance.address, 'Public beneficiary was not set correctly')
              })
          })
      })
  })

  it('should allow fee change', () => {
    return WyvernExchange
      .deployed()
      .then(exchangeInstance => {
        return exchangeInstance.setFees(0, 0, 0, 11, 11, 11)
          .then(() => {
            return exchangeInstance.feeFrontend.call()
              .then(fee => {
                assert.equal(fee.toNumber(), 11, 'Fees were not changed correctly')
              })
          })
      })
  })

  it('should allow item listing', () => {
    return WyvernExchange
      .deployed()
      .then(exchangeInstance => {
        return TestToken
          .deployed()
          .then(tokenInstance => {
            return DirectEscrowProvider
              .deployed()
              .then(escrowProviderInstance => {
                return exchangeInstance.listItem(1, '0x', 0, tokenInstance.address, 100, 0, 0, tokenInstance.address, '0x', escrowProviderInstance.address)
                  .then(() => {
                    return exchangeInstance.items.call(0)
                      .then(item => {
                        assert.equal(item[0], accounts[0], 'Item not listed correctly')
                      })
                  })
              })
          })
      })
  })

  it('should allow item removal', () => {
    return WyvernExchange
      .deployed()
      .then(exchangeInstance => {
        return exchangeInstance.removeItem.call(0)
          .then(ret => {
            assert.equal(ret.length, 0, 'Item was not removed')
          })
      })
  })

  /*
  it('should allow item purchase', () => {
    return WyvernExchange
      .deployed()
      .then(exchangeInstance => {
        web3.eth.sign('0x', accounts[0]).then(signature => {
          signature = signature.substr(2)
          const r = '0x' + signature.slice(0, 64)
          const s = '0x' + signature.slice(64, 128)
          const v = 27 + parseInt('0x' + signature.slice(128, 130), 16)
          return exchangeInstance.purchaseItem(0, exchangeInstance.address, '0x', '0x', 0, 0, v, r, s)
            .then(() => {
            })
        })
      })
  })
  */
})
