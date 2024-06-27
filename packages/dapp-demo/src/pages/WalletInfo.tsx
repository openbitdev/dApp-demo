// Copyright 2019-2022 @subwallet/sub-connect authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import { Wallet } from "@openbit/wallet-connect/build/types";
import React from 'react';

import AccountList from '../components/AccountList';
// import { WalletContext } from '../contexts';

require('./WalletInfo.scss');

function WalletInfo (): React.ReactElement {
  // const walletContext = useContext(WalletContext);

  return <div className={'boxed-container'}>
    <div className={'wallet-info-page'}>
      <div className='wallet-info-page__text'>Version: </div>
      <div className='wallet-info-page__text'>Account List</div>
      <AccountList />
      <div className='wallet-info-page__text'>Metadata</div>
    </div>
  </div>;
}

export default WalletInfo;
