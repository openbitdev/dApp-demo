// Copyright 2019-2022 @subwallet/sub-connect authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SatsConnector } from '@gobob/sats-wagmi';
import { EvmWallet, WalletAccount } from '@openbit/wallet-connect/types';
import React from 'react';

export interface WalletContextInterface {
  evmWallet?: EvmWallet,
  wallet?: SatsConnector,
  accounts: WalletAccount[],
  setWallet: (wallet: EvmWallet | undefined | SatsConnector, walletType: 'bitcoin'|'evm') => void
  walletType: 'bitcoin'|'evm';
}

export const WalletContext = React.createContext<WalletContextInterface>({
  accounts: [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setWallet: (wallet, walletType: 'bitcoin'|'evm') => {},
  walletType: 'bitcoin'
});

interface OpenSelectWalletInterface {
  isOpen: boolean,
  open: () => void
  close: () => void
}

export const OpenSelectWallet = React.createContext<OpenSelectWalletInterface>({
  isOpen: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  open: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  close: () => {}
});
