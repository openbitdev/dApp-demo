// Copyright 2019-2022 @subwallet/sub-connect authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import { Wallet } from "@openbit/wallet-connect/build/types";
import { SatsConnector, useAccount } from '@gobob/sats-wagmi';
import { Inscribe } from '@openbit/dapp-demo/pages/WalletInfo/parts/Inscribe';
import { SendTransfer } from '@openbit/dapp-demo/pages/WalletInfo/parts/SendTransfer';
import { SignPSBT } from '@openbit/dapp-demo/pages/WalletInfo/parts/SignPSBT';
import React from 'react';

import { SendInscription } from './parts/SendInscription';
// import { WalletContext } from '../contexts';

require('./WalletInfo.scss');

type ComponentProps = {
  wallet: SatsConnector,
  address: string;
}

function Component ({ address, wallet }: ComponentProps) {
  console.log('wallet', wallet);

  return (
    <div className={'boxed-container'}>
      <div className={'wallet-info-page'}>

        <div className='wallet-info-page__section'>
          <div className='wallet-info-page__text'>Account:</div>

          <div>
            {address}
          </div>
        </div>

        <SendTransfer wallet={wallet} />

        <SignPSBT wallet={wallet} />

        <SendInscription wallet={wallet} />

        <Inscribe wallet={wallet} />
      </div>
    </div>
  );
}

function WalletInfo (): React.ReactElement {
  const { address, connector } = useAccount();

  if (!connector || !address) {
    return (
      <div className={'boxed-container'}>
        <div className={'wallet-info-page'}>

          <div className={'wallet-info-page__text'}>
            Please connect the wallet
          </div>
        </div>
      </div>
    );
  }

  return (
    <Component
      address={address}
      wallet={connector}
    />
  );
}

export default WalletInfo;
