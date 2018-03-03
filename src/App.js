import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const { web3 } = window
let Coinsling, pollTx

if (web3) {
  Coinsling = require('coinsling')(web3).Coinsling
  pollTx = require('poll-tx-receipt')(web3)
}

// https://imgur.com/a/fk5Xr

class EtherscanLink extends Component {
  render() {
    const { path, networkId, children } = this.props
    const ids = {
      42: 'kovan.etherscan.io',
      1: 'etherscan.io'
    }
    const host = ids[networkId]
    return <a target='_blank'
      href={`https://${host}/${path}`}>
      {children}
    </a>
  }
}

class App extends Component {
  constructor() {
    super()

    this.state = {
      tokenForm: {},
      waitingForTx: false,
      createdToken: false,
      networkId: '1',
      noWeb3: web3 === undefined
    }

    if (web3) {
      web3.version.getNetwork((err, networkId) => {
        this.setState({ networkId })
      })
    }

    fetch('https://api.coinmarketcap.com/v1/ticker/ethereum/')
    .then(response => {
      return response.json()
    })
    .then(data => {
      this.setState({ ticker: data[0] })
    })  
  }

  render() {

    const logo = <div style={{textAlign: 'center'}}>
      <img src='logo.png' style={{maxWidth: '400px', marginTop: '50px'}} />
    </div>

    if (!web3 || (web3 && web3.eth.accounts.length == 0)) {
      return <div className="App">
        <div className='columns'>
          <div className='column is-half is-offset-one-quarter'>
            {logo}
            {!web3 && <div className='box' style={{marginTop: '50px'}}>
              <h3 className='is-size-3'>No Web3</h3>
              <p>
                Coinsmith needs an in-browser Ethereum wallet
                to interact with the Ethereum blockchain.
                <br />
                <br />
                MetaMask is an excellent option an in-browser wallet that can be downloaded
                from their website.
                <br />
                <br />
              </p>
              <div style={{textAlign: 'center'}}>
                <a href='https://metamask.io'>
                  <img src='metamask.png' style={{maxWidth: '400px'}} />
                </a>
              </div>
            </div>}

            {web3 && <div className='box' style={{marginTop: '50px'}}>
              Please unlock your Ethereum wallet and reload the page.
            </div>}
          </div>
        </div>
      </div>

    }

    const { tokenForm, waitingForTx, createdToken, networkId } = this.state
    // https://i.imgur.com/WVpMUMT.png

    const totalSupply = tokenForm.totalSupply && web3.toBigNumber(tokenForm.totalSupply).toFormat()

    const waiting = <p>
      Waiting for your transaction to be confirmed.
      &nbsp;<EtherscanLink path={`tx/${waitingForTx}`} networkId={networkId}>Check the status.</EtherscanLink>
      {/* <a target='_blank' href={`https://etherscan.io/address/${waitingForTx}`}>Check the status.</a>. */}
    </p>

    const success = <div>
      <p className='is-size-5'>
        Success! Your token has been created at contract address&nbsp;
        <EtherscanLink networkId={networkId} path={`address/${createdToken}`}>{createdToken}</EtherscanLink>
        <br />
        <br />
        To see your token in MetaMask: open your MetaMask window, click "Tokens",
        and enter the contract address into the form provided ({createdToken}).
      </p>
    </div>

    const formContents = <div>
      <div className="field">
        <label className="label">Symbol</label>
        <div className="control">
          <input
            onChange={this.setTokenForm.bind(this)}
            className="input" type="text" name="symbol" placeholder="AWE"  />
        </div>
      </div>

      <div className='field'>
        <label className='label'>Name</label>
        <div className='control'>
          <input className='input' onChange={this.setTokenForm.bind(this)} type="text" name="name" placeholder='Awesome Token' />
        </div>
      </div>

      <div className='field'>
        <label className='label'>Description</label>
        <div className='control'>
          <input className='input' onChange={this.setTokenForm.bind(this)} type="text" name="description" placeholder="The token for awesome people." />
        </div>
      </div>

      <div className='field'>
        <label className='label'>Logo URL</label>
        <div className='control'>
          <input className='input' onChange={this.setTokenForm.bind(this)} type="text" name="logoURL" placeholder="https://imgur.com/a/your_logo" />
        </div>
      </div>

      <div className='field'>
        <label className='label'>Total Supply</label>
        <div className='control'>
          <input className='input' onChange={this.setTokenForm.bind(this)} step='1e-18' type="number" name="totalSupply" placeholder="100,000,000" />
        </div>
      </div>

      <p>
        All tokens will be deposited into your Ethereum Wallet {web3.eth.coinbase},
        where you may transfer them, airdrop them, sell them on an exchange, etc.
      </p>
      <br />
      <p>
        Tokens you create are 100% yours. Each token you create with this site
        includes a small donation (about $5, paid in ETH) to the developers of this site.
      </p>
      <br />
      <p className='is-size-7'>
        Tokens are completely ERC20 compliant.
        YOU WILL NOT BE ABLE TO MODIFY THE TOKEN AFTER IT IS CREATED (except for the logo URL).
      </p>
      <br />
      <div className="field">
        <div className="control" style={{textAlign: 'right'}}>
          <input type='submit' className="button is-link" value='Create' />
        </div>
      </div>
    </div>

    const tokenFormEl = <form className='pure-form' onSubmit={this.createToken.bind(this)}>
      <h3 className='is-size-3'>Create a Token</h3>
      <p>Create your very own ERC20 token.</p>
      <br />

      <div className='box'>
        <div className='is-flex'>
          <figure className="image is-64x64">
            <img src={tokenForm.logoURL || 'https://i.imgur.com/WVpMUMT.png'} />
          </figure>
          <div style={{marginLeft: '10px', flexDirection: 'column', flexGrow: 1}} className='is-flex'>
            <div className='is-flex' style={{justifyContent: 'space-between', flex: 'grow'}}>
              <h3 style={{lineHeight: 'normal'}} className='is-size-3'>{tokenForm.name || 'Awesome Token'}</h3>
              <p style={{lineHeight: 'normal'}} className='is-size-3 has-text-weight-light'>{tokenForm.symbol || 'AWE'}</p>
            </div>
            <p className='has-text-weight-light'>{totalSupply || '100,000,000'} TOTAL SUPPLY</p>
            <p className='is-size-6'>{tokenForm.description || 'The awesome token for awesome people.'}</p>
          </div>
        </div>
      </div>

      {!waitingForTx && !createdToken && formContents}
      {waitingForTx && waiting}
      {createdToken && success}
    </form>

    const app = <div className='column is-half is-offset-one-quarter'>
      {logo}
      <div className='box' style={{marginTop: '50px'}}>
        {tokenFormEl}
      </div>

      {/* <div className='box'>
        <form>
          <h3 className='is-size-3'>Check Existing Transaction</h3>
          <br />
          Already created a token? You can check the status of a transaction here

          <div className='field'>
            <label className='label'>Transaction Hash</label>
            <div className='control'>
              <input className='input' type="text" placeholder="0xa8e17..." />
            </div>
          </div>
          <div className="field">
            <div className="control" style={{textAlign: 'right'}}>
              <input type='submit' className="button is-link" value='Create' />
            </div>
          </div>
        </form>
      </div> */}
    </div>

    return (
      <div className="App">
        <div className='columns'>
          {app}
        </div>
      </div>
    );
  }

  setTokenForm(e) {
    let { tokenForm } = this.state

    tokenForm[e.target.name] = e.target.value
    this.setState({ tokenForm })
  }

  createToken(e) {
    e.preventDefault()

    const { tokenForm, ticker } = this.state
    const fee = web3.toWei(5 / ticker.price_usd)

    Coinsling.sling(
      tokenForm.description || '',
      tokenForm.logoURL || '',
      tokenForm.name,
      tokenForm.symbol,
      web3.toWei(tokenForm.totalSupply),
      {
        from: web3.eth.coinbase,
        value: fee
      }
    )
    .then(tx => {
      this.setState({ tokenForm: {}, waitingForTx: tx })
      return pollTx(tx)
    })
    .then(receipt => {
      this.setState({ createdToken: receipt.logs[0].address, waitingForTx: false })
    })
  }
}

export default App;
