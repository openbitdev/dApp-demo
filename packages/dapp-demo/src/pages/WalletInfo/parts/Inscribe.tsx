import { SatsConnector } from '@gobob/sats-wagmi';
import { Button, Input, message as MessageNotifier, Select } from 'antd';
import React, { useCallback, useState } from 'react';

type Props = {
  wallet: SatsConnector,
}
type ContentType = 'text' | 'image';
const DEFAULT_CONTENT_TYPE = 'text';

export function Inscribe ({ wallet }: Props): React.ReactElement {
  const [fieldContentType, setFieldContentType] = useState<ContentType>(DEFAULT_CONTENT_TYPE);
  const [fieldContent, setFieldContent] = useState<string>('');

  // @ts-ignore
  const [transactionLink, setTransactionLink] = useState<string | undefined>(undefined);

  const _onChangeFieldContentType = useCallback(
    (value: string) => {
      setFieldContentType(value as ContentType);
    },
    []
  );

  const _onChangeFieldContent = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFieldContent(e.target.value);
    },
    []
  );

  const _onSubmit = useCallback(
    () => {
      wallet.inscribe(fieldContentType, fieldContent).catch(async (e) => {
        console.log('e', e);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
        await MessageNotifier.error(`${e.error?.message || e.message}`);
      });
    },
    [fieldContent, fieldContentType, wallet]
  );

  return (
    <div className='wallet-info-page__section'>
      <div className='wallet-info-page__text'>Inscribe</div>

      <div className='wallet-transaction_row'>
        <span className='label'>Content type</span>

        <Select
          defaultValue={DEFAULT_CONTENT_TYPE}
          onChange={_onChangeFieldContentType}
          options={[
            { value: 'text', label: 'Text' },
            { value: 'image', label: 'Image' }
          ]}
        />
      </div>

      <div className='wallet-transaction_row'>
        <span className='label'>Content</span>

        <div className='input-wrapper'>
          <Input.TextArea
            className='code'
            onChange={_onChangeFieldContent}
          />
        </div>
      </div>

      <div>
        <Button
          className='sub-wallet-btn sub-wallet-btn-small-size transaction-button'
          onClick={_onSubmit}
        >
          Inscribe
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
