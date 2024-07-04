// Copyright 2019-2022 @subwallet/sub-connect authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LoadingOutlined } from '@ant-design/icons';
import { SatsConnector, useConnect } from '@gobob/sats-wagmi';
import { getEvmWallets } from '@openbit/wallet-connect/evm/evmWallets';
import { EvmWallet } from '@openbit/wallet-connect/types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

require('./SelectWallet.scss');

interface Props {
  onSelectWallet: (walletKey: string, walletType?: 'bitcoin' | 'evm') => void
}

function SelectWallet ({ onSelectWallet }: Props): React.ReactElement<Props> {
  const evmWallets = getEvmWallets();
  const { connectors } = useConnect();
  const [isPreparingConnectors, setIsPreparingConnectors] = useState(true);

  const sortedConnectors = useMemo(() => {
    const openBitConnector = connectors.find((c) => c.id === 'openbit');

    if (openBitConnector) {
      return [openBitConnector, ...connectors.filter((c) => c.id !== 'openbit')];
    }

    return connectors;
  }, [connectors]);

  useEffect(() => {
    let isSync = true;

    Promise.all(connectors.map((c) => c.isReady())).catch(console.log).finally(() => {
      if (isSync) {
        setIsPreparingConnectors(false);
      }
    });

    return () => {
      isSync = false;
    };
  }, [connectors]);

  const onClickBitcoinWallet = useCallback(
    (wallet: SatsConnector) => {
      return () => {
        if (wallet.ready) {
          onSelectWallet(wallet.name, 'bitcoin');
        }
      };
    },
    [onSelectWallet]
  );

  const onClickEvmWallet = useCallback(
    (wallet: EvmWallet) => {
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
      <div className={'wallet-title'}>
        {wallet.name}
      </div>

      {!isPreparingConnectors && !wallet.ready
        ? (
          <div className={'wallet-install'}>
            {wallet.ready
              ? ''
              : (
                <a
                  href={wallet.homepage}
                  rel='noreferrer'
                  target='_blank'
                >
                Install
                </a>
              )}
          </div>
        )
        : null}

      {isPreparingConnectors && (
        <LoadingOutlined />
      )}
    </div>
  );

  return <div className={'select-wallet-wrapper'}>
    <div className={'select-wallet-content'}>
      <div className='dotsama-wallet-list'>
        <div className='wallet-cat-title'>
          Bitcoin Wallets
        </div>

        {sortedConnectors.map((wallet) => (walletItemBTC(wallet, onClickBitcoinWallet)))}
      </div>

      <div className='evm-wallet-list hidden'>
        <div className='wallet-cat-title'>
          EVM Wallets
        </div>

        {evmWallets.map((wallet) => (walletItem(wallet, onClickEvmWallet)))}
      </div>
    </div>
  </div>;
}

export default SelectWallet;
