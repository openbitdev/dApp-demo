// Copyright 2019-2022 @subwallet/sub-connect authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { EvmWallet } from "@openbit/wallet-connect/build/types";
import { getEvmWallets} from "@openbit/wallet-connect/build/evm/evmWallets";
import React, { useCallback } from 'react';
import { useConnect, SatsConnector } from '@gobob/sats-wagmi';
require('./SelectWallet.scss');

interface Props {
  onSelectWallet: (walletKey: string, walletType?: 'bitcoin' | 'evm') => void
}

function SelectWallet ({ onSelectWallet }: Props): React.ReactElement<Props> {
  const evmWallets = getEvmWallets();
  const { connectors } = useConnect();

  const onClickBitcoinWallet = useCallback(
    (wallet: SatsConnector) => {
      return () => {

          onSelectWallet(wallet.name, 'bitcoin');

      };
    },
    [onSelectWallet]
  );

  const onClickEvmWallet = useCallback(
    (wallet:  EvmWallet) => {
      return () => {
        if (wallet.installed) {
          onSelectWallet(wallet.extensionName, 'evm');
        }
      };
    },
    [onSelectWallet]
  );

  const walletItem: (wallet: EvmWallet, onSelect: (wallet: EvmWallet) => () => void) => React.ReactElement = (wallet, onSelect) => (
    <div
      className={'wallet-item'}
      key={wallet.extensionName}
      onClick={onSelect(wallet)}
    >
      <div>
        <img
          alt={wallet.logo?.alt}
          className={'wallet-logo'}
          src={wallet.logo?.src}
        />
      </div>
      <div className={'wallet-title'}>
        {wallet.title}
      </div>
      <div className={'wallet-install'}>
        {wallet.installed
          ? ''
          : (<a
            href={wallet.installUrl}
            rel='noreferrer'
            target='_blank'
          >
            Install
          </a>)}
      </div>
    </div>
  );

  const walletItemBTC: (wallet: SatsConnector, onSelect: (wallet: SatsConnector) => () => void) => React.ReactElement = (wallet, onSelect) => (
    <div
      className={'wallet-item'}
      key={wallet.name}
      onClick={onSelect(wallet)}
    >
      <div>

      </div>
      <div className={'wallet-title'}>
        {wallet.name}
      </div>
      {/*<div className={'wallet-install'}>*/}
      {/*  {wallet.isReady()*/}
      {/*    ? ''*/}
      {/*    : (<a*/}
      {/*      href={wallet.installUrl}*/}
      {/*      rel='noreferrer'*/}
      {/*      target='_blank'*/}
      {/*    >*/}
      {/*      Install*/}
      {/*    </a>)}*/}
      {/*</div>*/}
    </div>
  );

  return <div className={'select-wallet-wrapper'}>
    <div className={'select-wallet-content'}>
      <div className='dotsama-wallet-list'>
        <div className='wallet-cat-title'>
          Bitcoin Wallets
        </div>
        {connectors.map((wallet) => (walletItemBTC(wallet, onClickBitcoinWallet)))}
      </div>
      <div className='evm-wallet-list'>
        <div className='wallet-cat-title'>
          EVM Wallets
        </div>
        {evmWallets.map((wallet) => (walletItem(wallet, onClickEvmWallet)))}
      </div>
    </div>
  </div>;
}

export default SelectWallet;
