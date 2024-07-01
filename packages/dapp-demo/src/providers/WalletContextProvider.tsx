// Copyright 2019-2022 @subwallet/wallet-connect authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SatsConnector, useConnect } from '@gobob/sats-wagmi';
import { useLocalStorage } from '@openbit/dapp-demo/hooks/useLocalStorage';
import { windowReload } from '@openbit/dapp-demo/utils/window';
import { getEvmWalletBySource } from '@openbit/wallet-connect/evm/evmWallets';
import { EvmWallet, WalletAccount } from '@openbit/wallet-connect/types';
import React, { useCallback, useEffect, useState } from 'react';

import { OpenSelectWallet, WalletContext, WalletContextInterface } from '../contexts';

interface Props {
  children: React.ReactElement;
}

export function WalletContextProvider ({ children }: Props) {
  const [walletKey, setWalletKey] = useLocalStorage('wallet-key');
  const [walletType, setWalletType] = useLocalStorage('wallet-type', 'substrate');
  const [currentWallet, setCurrentWallet] = useState<EvmWallet | undefined | SatsConnector>(getEvmWalletBySource(walletKey));
  const [isSelectWallet, setIsSelectWallet] = useState(false);
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const { connect, connectors } = useConnect();

  // getAccount
  const afterSelectWallet = useCallback(
    async (wallet: SatsConnector) => {
      try {
        if (!(await wallet.isReady())) {
          connect({
            connector: wallet
          });
        }
      } catch (e) {
        return;
      }

      const address = wallet.getAccount();

      if (address) {
        setAccounts([{
          address,
          source: wallet.id
        }]);
      }
    },
    [connect]
  );

  const getConnectBitcoin = (connector: string) => {
    return connectors.find(({ name }) => name === walletKey);
  };

  const selectWallet = useCallback(
    async (wallet: SatsConnector) => {
      // if (!wallet.isAuthorized()) {
      //   try {
      //     await wallet.connect();
      //   } catch (e) {
      //     console.log('Error when connect()', e);
      //
      //     return;
      //   }
      // }

      connect({
        connector: wallet
      });

      setCurrentWallet(currentWallet);

      setWalletKey(wallet.name);

      await afterSelectWallet(wallet);
    },
    [afterSelectWallet, connect, currentWallet, setWalletKey]
  );

  const afterSelectEvmWallet = useCallback(
    async (wallet: EvmWallet) => {
      await wallet?.enable(); // Quick call extension?.request({ method: 'eth_requestAccounts' });
    },
    []
  );

  const selectEvmWallet = useCallback(
    async (wallet: EvmWallet) => {
      await afterSelectEvmWallet(wallet);

      setCurrentWallet(currentWallet);

      setWalletKey(wallet.extensionName);

      windowReload();
    },
    [afterSelectEvmWallet, currentWallet, setWalletKey]
  );

  const walletContext = {
    wallet: getConnectBitcoin(walletKey),
    evmWallet: getEvmWalletBySource(walletKey),
    accounts,
    setWallet: (wallet: EvmWallet | undefined | SatsConnector, walletType: 'bitcoin' | 'evm') => {
      if (walletType === 'bitcoin' && wallet) {
        // @ts-ignore
        wallet && selectWallet(wallet as SatsConnector);
      } else {
        wallet && selectEvmWallet(wallet as EvmWallet);
      }

      wallet && setWalletType(walletType);
    },
    walletType
  };

  const selectWalletContext = {
    isOpen: isSelectWallet,
    open: () => {
      setIsSelectWallet(true);
    },
    close: () => {
      setIsSelectWallet(false);
    }
  };

  useEffect(
    () => {
      if (walletType === 'bitcoin') {
        const wallet = connectors.find(({ name }) => name === walletKey);

        setTimeout(() => {
          wallet && wallet?.isReady().then(() => {
            afterSelectWallet(wallet).catch(console.error);
          }).catch(console.log);
        }, 150);
      } else {
        const evmWallet = getEvmWalletBySource(walletKey);

        evmWallet && evmWallet?.isReady.then(() => {
          afterSelectEvmWallet(evmWallet).catch(console.error);
        });
      }
    },
    [afterSelectEvmWallet, afterSelectWallet, connectors, walletKey, walletType]
  );

  return (
    <WalletContext.Provider value={walletContext as WalletContextInterface}>
      <OpenSelectWallet.Provider value={selectWalletContext}>
        {children}
      </OpenSelectWallet.Provider>
    </WalletContext.Provider>
  );
}
