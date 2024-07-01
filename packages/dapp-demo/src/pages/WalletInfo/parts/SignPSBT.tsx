import { SatsConnector } from '@gobob/sats-wagmi';
import { Button, Input, message as MessageNotifier } from 'antd';
import { networks, Psbt } from 'bitcoinjs-lib';
import React, { useCallback, useState } from 'react';

type Props = {
  wallet: SatsConnector,
}

const DEFAULT_INPUT_INDEX = 0;

export function SignPSBT ({ wallet }: Props): React.ReactElement {
  const [fieldPsbt, setFieldPsbt] = useState<string>('');
  const [fieldInputIndex, setFieldInputIndex] = useState<number>(DEFAULT_INPUT_INDEX);

  // @ts-ignore
  const [transactionLink, setTransactionLink] = useState<string | undefined>(undefined);

  const _onChangeFieldPsbt = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFieldPsbt(e.target.value);
    },
    []
  );

  const _onChangeFieldInputIndex = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFieldInputIndex(Number(e.target.value));
    },
    []
  );

  const sendTransaction = useCallback(
    () => {
      try {
        const _psbt = Psbt.fromHex(fieldPsbt, {
          network: wallet.network === 'testnet' ? networks.testnet : networks.bitcoin
        });

        wallet.signInput(fieldInputIndex, _psbt).catch(async (e) => {
          console.log('e', e);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
          await MessageNotifier.error(`${e.error?.message || e.message}`);
        });
      } catch (e) {
        (async () => {
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
          await MessageNotifier.error(`${e.error?.message || e.message}`);
        })().catch(console.log);
      }
    },
    [fieldInputIndex, fieldPsbt, wallet]
  );

  return (
    <div className='wallet-info-page__section'>
      <div className='wallet-info-page__text'>SignPSBT</div>

      <div className='wallet-transaction_row'>
        <span className='label'>PSBT (hex)</span>

        <Input.TextArea
          className='code'
          onChange={_onChangeFieldPsbt}
        />
      </div>

      <div className='wallet-transaction_row'>
        <span className='label'>Input index</span>

        <div className='input-wrapper'>
          <Input
            className='code'
            defaultValue={DEFAULT_INPUT_INDEX}
            onChange={_onChangeFieldInputIndex}
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
          Sign PSBT
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
