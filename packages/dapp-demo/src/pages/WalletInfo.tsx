// Copyright 2019-2022 @subwallet/sub-connect authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import { Wallet } from "@openbit/wallet-connect/build/types";
import { SatsConnector } from '@gobob/sats-wagmi';
import { WalletContext } from '@openbit/dapp-demo/contexts';
import React, { useContext } from 'react';
// import { WalletContext } from '../contexts';

require('./WalletInfo.scss');

type ComponentProps = {
  wallet: SatsConnector
}

function Component ({ wallet }: ComponentProps) {
  console.log('wallet', wallet);

  return (
    <div className={'boxed-container'}>
      <div className={'wallet-info-page'}>

      </div>
    </div>
  );
}

function WalletInfo (): React.ReactElement {
  const { wallet } = useContext(WalletContext);

  if (!wallet) {
    return (<></>);
  }

  return <Component wallet={wallet} />;
}

export default WalletInfo;
