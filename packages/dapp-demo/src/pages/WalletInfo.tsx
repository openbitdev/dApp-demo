// Copyright 2019-2022 @subwallet/sub-connect authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import { Wallet } from "@openbit/wallet-connect/build/types";
import { SatsConnector, useAccount } from '@gobob/sats-wagmi';
import { Button, Input } from 'antd';
import React, { useCallback, useState } from 'react';
// import { WalletContext } from '../contexts';

require('./WalletInfo.scss');

type ComponentProps = {
  wallet: SatsConnector,
  address: string;
}

function Component ({ address, wallet }: ComponentProps) {
  console.log('wallet', wallet);

  const [transactionToAddress, setTransactionToAddress] = useState('');
  const [transactionAmount, setTransactionAmount] = useState<number>(0);

  // @ts-ignore
  const [transactionLink, setTransactionLink] = useState<string | undefined>(undefined);

  const _onChangeTransactionToAddress = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTransactionToAddress(e.target.value);
    },
    []
  );

  const _onChangeTransactionAmount = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTransactionAmount(Number(e.target.value) * 10 ** 8);
    },
    []
  );

  const sendTransaction = useCallback(
    () => {
      wallet.sendToAddress(transactionToAddress, transactionAmount).catch(console.log);
    },
    [transactionAmount, transactionToAddress, wallet]
  );

  return (
    <div className={'boxed-container'}>
      <div className={'wallet-info-page'}>

        <div className='wallet-info-page__section'>
          <div className='wallet-info-page__text'>Account:</div>

          <div>
            {address}
          </div>
        </div>

        <div className='wallet-info-page__section'>
          <div className='wallet-info-page__text'>Transactions</div>

          <div className='wallet-transaction_row'>
            <span className='label'>To Address</span>

            <Input
              className='code'
              onChange={_onChangeTransactionToAddress}
              type='text'
            />
          </div>

          <div className='wallet-transaction_row'>
            <span className='label'>Amount</span>

            <div className='input-wrapper'>
              <Input
                className='code'
                defaultValue={transactionAmount}
                onChange={_onChangeTransactionAmount}
                type='number'
              />

              <span className='suffix'>BTC</span>
            </div>
          </div>

          <div>
            <Button
              className='sub-wallet-btn sub-wallet-btn-small-size transaction-button'
              onClick={sendTransaction}
            >
              Send transaction
            </Button>

            {transactionLink && <div>
              Check transaction on block explorer by click
              <a
                href={transactionLink}
                rel='noreferrer'
                target='_blank'
              > here</a>
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function WalletInfo (): React.ReactElement {
  const { address, connector } = useAccount();

  console.log('address-----', address, connector);

  if (!connector || !address) {
    return (<></>);
  }

  return (
    <Component
      address={address}
      wallet={connector}
    />
  );
}

export default WalletInfo;
