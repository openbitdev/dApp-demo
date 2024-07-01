import { SatsConnector } from '@gobob/sats-wagmi';
import { Button, Input, message as MessageNotifier } from 'antd';
import React, { useCallback, useState } from 'react';

type Props = {
  wallet: SatsConnector,
}

const DEFAULT_FEE_RATE = 1;

export function SendInscription ({ wallet }: Props): React.ReactElement {
  const [fieldToAddress, setFieldToAddress] = useState('');
  const [fieldInscriptionId, setFieldInscriptionId] = useState<string>('');
  const [fieldFeeRate, setFieldFeeRate] = useState<number>(DEFAULT_FEE_RATE);

  // @ts-ignore
  const [transactionLink, setTransactionLink] = useState<string | undefined>(undefined);

  const _onChangeToAddress = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFieldToAddress(e.target.value);
    },
    []
  );

  const _onChangeFieldInscriptionId = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFieldInscriptionId(e.target.value);
    },
    []
  );

  const _onChangeFieldFeeRate = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFieldFeeRate(Number(e.target.value));
    },
    []
  );

  const _onSubmit = useCallback(
    () => {
      wallet.sendInscription(fieldToAddress, fieldInscriptionId, fieldFeeRate).catch(async (e) => {
        console.log('e', e);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
        await MessageNotifier.error(`${e.error?.message || e.message}`);
      });
    },
    [fieldFeeRate, fieldInscriptionId, fieldToAddress, wallet]
  );

  return (
    <div className='wallet-info-page__section'>
      <div className='wallet-info-page__text'>SendInscription</div>

      <div className='wallet-transaction_row'>
        <span className='label'>To Address</span>

        <Input
          className='code'
          onChange={_onChangeToAddress}
          type='text'
        />
      </div>

      <div className='wallet-transaction_row'>
        <span className='label'>Inscription Id</span>

        <Input
          className='code'
          onChange={_onChangeFieldInscriptionId}
          type='text'
        />
      </div>

      <div className='wallet-transaction_row'>
        <span className='label'>Fee Rate</span>

        <div className='input-wrapper'>
          <Input
            className='code'
            defaultValue={DEFAULT_FEE_RATE}
            onChange={_onChangeFieldFeeRate}
            type='number'
          />

          <span className='suffix'>sats/vB</span>
        </div>
      </div>

      <div>
        <Button
          className='sub-wallet-btn sub-wallet-btn-small-size transaction-button'
          onClick={_onSubmit}
        >
          Send Inscription
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
