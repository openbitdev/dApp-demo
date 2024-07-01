// Copyright 2019-2022 @subwallet/sub-connect authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button } from 'antd';
import React, { useContext } from 'react';

import { OpenSelectWallet, WalletContext } from '../contexts';

require('./WalletHeader.scss');

interface Props {
  visible?: boolean;
  walletType: 'bitcoin'|'evm';
}

function WalletHeader ({ visible, walletType }: Props): React.ReactElement<Props> {
  const walletContext = useContext(WalletContext);
  const selectWallet = useContext(OpenSelectWallet);
  const bitcoinWallet = walletContext.wallet;
  const evmWallet = walletContext.evmWallet;

  if (!visible) {
    return (<></>);
  }

  if (walletType === 'bitcoin') {
    return (<header className={'wallet-header-wrapper'}>
      <div className={'boxed-container'}>
        <div className={'wallet-header-content'}>
          <div className={'wallet-title'}>
            <span>
              {bitcoinWallet?.name}
            </span>

            {
              bitcoinWallet?.network && (
                <span>
                  &nbsp;({bitcoinWallet?.network === 'mainnet' ? 'Mainet' : 'Testnet'})
                </span>
              )
            }
          </div>

          <div className='spacer' />

          <Button
            className='sub-wallet-btn sub-wallet-btn-small-size'
            onClick={selectWallet.open}
            type={'primary'}
          >Select Wallet</Button>
        </div>
      </div>
    </header>);
  }

  return (<header className={'wallet-header-wrapper'}>
    <div className={'boxed-container'}>
      <div className={'wallet-header-content'}>
        <div>
          <img
            alt={evmWallet?.logo?.alt}
            className={'wallet-logo'}
            src={evmWallet?.logo?.src}
          />
        </div>

        <div className={'wallet-title'}>
          {evmWallet?.title}
        </div>

        <div className='spacer' />

        <Button
          className='sub-wallet-btn sub-wallet-btn-small-size'
          onClick={selectWallet.open}
          type={'primary'}
        >Select Wallet</Button>
      </div>
    </div>
  </header>);
}

export default WalletHeader;
