import { SatsConnector } from '@gobob/sats-wagmi';
import { Button, Input, message as MessageNotifier } from 'antd';
import React, { useCallback, useState } from 'react';

type Props = {
  wallet: SatsConnector,
}

export function SendTransfer ({ wallet }: Props): React.ReactElement {
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
      wallet.sendToAddress(transactionToAddress, transactionAmount).catch(async (e) => {
        console.log('e', e);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
        await MessageNotifier.error(`${e.error?.message || e.message}`);
      });
    },
    [transactionAmount, transactionToAddress, wallet]
  );

  return (
    <div className='wallet-info-page__section'>
      <div className='wallet-info-page__text'>SendTransfer</div>

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
  );
}
