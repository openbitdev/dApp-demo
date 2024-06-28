// Copyright 2019-2022 @subwallet/sub-connect authors & contributors
// SPDX-License-Identifier: Apache-2.0

import './SelectWallet.scss';

import { useConnect } from '@gobob/sats-wagmi';
import { getEvmWalletBySource } from '@openbit/wallet-connect/evm/evmWallets';
import { Modal } from 'antd';
import React, { useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { OpenSelectWallet, WalletContext } from '../contexts';
import SelectWallet from './SelectWallet';

interface Props {
  theme: string;
}

function SelectWalletModal ({ theme }: Props): React.ReactElement<Props> {
  const openSelectWalletContext = useContext(OpenSelectWallet);
  const walletContext = useContext(WalletContext);
  const navigate = useNavigate();
  const { connectors } = useConnect();
  const onSelectWallet = useCallback(
    (walletKey, walletType: 'bitcoin' | 'evm' = 'bitcoin') => {
      if (walletType === 'bitcoin') {
        const connector = connectors.find(({ name }) => name === walletKey);

        if (connector) {
          walletContext.setWallet(connector, walletType);
          openSelectWalletContext.close();
          navigate('/wallet-info');
        }
      } else {
        walletContext.setWallet(getEvmWalletBySource(walletKey), walletType);
        openSelectWalletContext.close();
        navigate('/evm-wallet-info');
      }
    },
    [connectors, navigate, openSelectWalletContext, walletContext]
  );

  return <Modal
    centered
    className={`select-wallet-modal ${theme === 'dark' ? '-dark' : '-light'}`}
    footer={false}
    maskStyle={{ backgroundColor: theme === 'dark' ? '#262C4A' : '#EEE' }}
    onCancel={openSelectWalletContext.close}
    title='Select Wallet'
    visible={openSelectWalletContext.isOpen}
    wrapClassName={'sub-wallet-modal-wrapper'}
  >
    <SelectWallet onSelectWallet={onSelectWallet} />
  </Modal>;
}

export default SelectWalletModal;
