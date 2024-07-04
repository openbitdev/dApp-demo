import { BitcoinNetwork } from '@gobob/types';
import { FC, ReactNode } from 'react';
import * as _gobob_react_query from '@gobob/react-query';
import { QueryClient } from '@gobob/react-query';
import { RemoteSigner } from '@gobob/bob-sdk';
import * as bitcoin from 'bitcoinjs-lib';
import { Psbt, Network as Network$1, Transaction } from 'bitcoinjs-lib';
import * as _metamask_providers_dist_utils from '@metamask/providers/dist/utils';
import { MetaMaskInpageProvider } from '@metamask/providers';

declare enum BitcoinScriptType {
    P2PKH = "P2PKH",
    P2SH_P2WPKH = "P2SH-P2WPKH",
    P2WPKH = "P2WPKH"
}

type WalletNetwork = Omit<BitcoinNetwork, 'regtest'>;

type Address = string;
declare abstract class SatsConnector {
    /** Unique connector id */
    abstract readonly id: string;
    /** Connector name */
    abstract readonly name: string;
    /** Extension or Snap homepage */
    abstract homepage: string;
    /** Whether connector is usable */
    ready: boolean;
    address: Address | undefined;
    publicKey: string | undefined;
    network: WalletNetwork;
    constructor(network: WalletNetwork);
    abstract connect(): Promise<void>;
    abstract sendToAddress(toAddress: string, amount: number): Promise<string>;
    abstract signInput(inputIndex: number, psbt: Psbt): Promise<Psbt>;
    abstract isReady(): Promise<boolean>;
    disconnect(): void;
    getAccount(): string | undefined;
    isAuthorized(): boolean;
    getNetwork(): Promise<Network$1>;
    getPublicKey(): Promise<string>;
    sendInscription(address: string, inscriptionId: string, feeRate?: number): Promise<string>;
    getTransaction(txId: string): Promise<Transaction>;
    inscribe(contentType: 'text' | 'image', content: string): Promise<string>;
    getSigner(): RemoteSigner;
}

type SatsConfigData = {
    connector?: SatsConnector;
    connectors: SatsConnector[];
    setConnector: (connector?: SatsConnector) => void;
};
declare const useSatsWagmi: () => SatsConfigData;
type SatsWagmiConfigProps = {
    children: ReactNode;
    network?: BitcoinNetwork;
    queryClient?: QueryClient;
};
declare const SatsWagmiConfig: FC<SatsWagmiConfigProps>;

declare const useConnect: () => {
    connectors: SatsConnector[];
    connect: _gobob_react_query.UseMutateFunction<void, unknown, {
        connector?: SatsConnector | undefined;
    }, unknown>;
    connectAsync: _gobob_react_query.UseMutateAsyncFunction<void, unknown, {
        connector?: SatsConnector | undefined;
    }, unknown>;
    data: undefined;
    error: null;
    isError: false;
    isIdle: true;
    isLoading: false;
    isSuccess: false;
    status: "idle";
    reset: () => void;
    context: unknown;
    failureCount: number;
    failureReason: unknown;
    isPaused: boolean;
    variables: {
        connector?: SatsConnector | undefined;
    } | undefined;
} | {
    connectors: SatsConnector[];
    connect: _gobob_react_query.UseMutateFunction<void, unknown, {
        connector?: SatsConnector | undefined;
    }, unknown>;
    connectAsync: _gobob_react_query.UseMutateAsyncFunction<void, unknown, {
        connector?: SatsConnector | undefined;
    }, unknown>;
    data: undefined;
    error: null;
    isError: false;
    isIdle: false;
    isLoading: true;
    isSuccess: false;
    status: "loading";
    reset: () => void;
    context: unknown;
    failureCount: number;
    failureReason: unknown;
    isPaused: boolean;
    variables: {
        connector?: SatsConnector | undefined;
    } | undefined;
} | {
    connectors: SatsConnector[];
    connect: _gobob_react_query.UseMutateFunction<void, unknown, {
        connector?: SatsConnector | undefined;
    }, unknown>;
    connectAsync: _gobob_react_query.UseMutateAsyncFunction<void, unknown, {
        connector?: SatsConnector | undefined;
    }, unknown>;
    data: undefined;
    error: unknown;
    isError: true;
    isIdle: false;
    isLoading: false;
    isSuccess: false;
    status: "error";
    reset: () => void;
    context: unknown;
    failureCount: number;
    failureReason: unknown;
    isPaused: boolean;
    variables: {
        connector?: SatsConnector | undefined;
    } | undefined;
} | {
    connectors: SatsConnector[];
    connect: _gobob_react_query.UseMutateFunction<void, unknown, {
        connector?: SatsConnector | undefined;
    }, unknown>;
    connectAsync: _gobob_react_query.UseMutateAsyncFunction<void, unknown, {
        connector?: SatsConnector | undefined;
    }, unknown>;
    data: void;
    error: null;
    isError: false;
    isIdle: false;
    isLoading: false;
    isSuccess: true;
    status: "success";
    reset: () => void;
    context: unknown;
    failureCount: number;
    failureReason: unknown;
    isPaused: boolean;
    variables: {
        connector?: SatsConnector | undefined;
    } | undefined;
};

declare const useAccount: () => {
    connector: SatsConnector | undefined;
    address: string | undefined;
    error: unknown;
    isError: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    refetch: <TPageData>(options?: (_gobob_react_query.RefetchOptions & _gobob_react_query.RefetchQueryFilters<TPageData>) | undefined) => Promise<_gobob_react_query.QueryObserverResult<string | undefined, unknown>>;
};

declare const useDisconnect: () => {
    disconnect: _gobob_react_query.UseMutateFunction<void, unknown, void, unknown>;
    disconnectAsync: _gobob_react_query.UseMutateAsyncFunction<void, unknown, void, unknown>;
    data: undefined;
    error: null;
    isError: false;
    isIdle: true;
    isLoading: false;
    isSuccess: false;
    status: "idle";
    reset: () => void;
    context: unknown;
    failureCount: number;
    failureReason: unknown;
    isPaused: boolean;
    variables: void | undefined;
} | {
    disconnect: _gobob_react_query.UseMutateFunction<void, unknown, void, unknown>;
    disconnectAsync: _gobob_react_query.UseMutateAsyncFunction<void, unknown, void, unknown>;
    data: undefined;
    error: null;
    isError: false;
    isIdle: false;
    isLoading: true;
    isSuccess: false;
    status: "loading";
    reset: () => void;
    context: unknown;
    failureCount: number;
    failureReason: unknown;
    isPaused: boolean;
    variables: void | undefined;
} | {
    disconnect: _gobob_react_query.UseMutateFunction<void, unknown, void, unknown>;
    disconnectAsync: _gobob_react_query.UseMutateAsyncFunction<void, unknown, void, unknown>;
    data: undefined;
    error: unknown;
    isError: true;
    isIdle: false;
    isLoading: false;
    isSuccess: false;
    status: "error";
    reset: () => void;
    context: unknown;
    failureCount: number;
    failureReason: unknown;
    isPaused: boolean;
    variables: void | undefined;
} | {
    disconnect: _gobob_react_query.UseMutateFunction<void, unknown, void, unknown>;
    disconnectAsync: _gobob_react_query.UseMutateAsyncFunction<void, unknown, void, unknown>;
    data: void;
    error: null;
    isError: false;
    isIdle: false;
    isLoading: false;
    isSuccess: true;
    status: "success";
    reset: () => void;
    context: unknown;
    failureCount: number;
    failureReason: unknown;
    isPaused: boolean;
    variables: void | undefined;
};

declare global {
    interface Window {
        XverseProviders: any;
    }
}
declare class XverseConnector extends SatsConnector {
    id: string;
    name: string;
    homepage: string;
    paymentAddress: string | undefined;
    constructor(network: WalletNetwork);
    connect(): Promise<void>;
    isReady(): Promise<boolean>;
    sendToAddress(toAddress: string, amount: number): Promise<string>;
    inscribe(contentType: 'text' | 'image', content: string): Promise<string>;
    signInput(inputIndex: number, psbt: Psbt): Promise<Psbt>;
}

type Response<T> = {
    jsonrpc: string;
    id: string;
    result: T;
};
type AddressResult$1 = {
    symbol: 'BTC' | 'STX';
    type: 'p2wpkh' | 'p2tr';
    address: string;
    publicKey: string;
    tweakedPublicKey: string;
    derivationPath: string;
};
interface SignPsbtRequestParams$1 {
    hex: string;
    allowedSighash?: any[];
    signAtIndex?: number | number[];
    network?: any;
    account?: number;
    broadcast?: boolean;
}
type RequestAddressesResult$1 = {
    addresses: AddressResult$1[];
};
type RequestAddressesFn$1 = (method: 'getAddresses') => Promise<Response<RequestAddressesResult$1>>;
type SendBTCFn$1 = (method: 'sendTransfer', options: {
    address: string;
    amount: string;
    network: WalletNetwork;
}) => Promise<Response<{
    txid: string;
}>>;
type SignPsbtFn$1 = (method: 'signPsbt', options: SignPsbtRequestParams$1) => Promise<Response<{
    hex: string;
}>>;
declare global {
    interface Window {
        btc: {
            request: RequestAddressesFn$1 & SendBTCFn$1 & SignPsbtFn$1;
        };
    }
}
declare class LeatherConnector extends SatsConnector {
    id: string;
    name: string;
    homepage: string;
    derivationPath: string | undefined;
    constructor(network: WalletNetwork);
    connect(): Promise<void>;
    isReady(): Promise<boolean>;
    sendToAddress(toAddress: string, amount: number): Promise<string>;
    signInput(inputIndex: number, psbt: Psbt): Promise<Psbt>;
}

type AccountsChangedEvent = (event: 'accountsChanged', handler: (accounts: Array<string>) => void) => void;
type Inscription = {
    inscriptionId: string;
    inscriptionNumber: string;
    address: string;
    outputValue: string;
    content: string;
    contentLength: string;
    contentType: string;
    preview: string;
    timestamp: number;
    offset: number;
    genesisTransaction: string;
    location: string;
};
type getInscriptionsResult = {
    total: number;
    list: Inscription[];
};
type SendInscriptionsResult = {
    txid: string;
};
type Balance = {
    confirmed: number;
    unconfirmed: number;
    total: number;
};
type Network = 'livenet' | 'testnet';
type Unisat = {
    requestAccounts: () => Promise<string[]>;
    getAccounts: () => Promise<string[]>;
    on: AccountsChangedEvent;
    removeListener: AccountsChangedEvent;
    getInscriptions: (cursor: number, size: number) => Promise<getInscriptionsResult>;
    sendInscription: (address: string, inscriptionId: string, options?: {
        feeRate: number;
    }) => Promise<SendInscriptionsResult>;
    switchNetwork: (network: 'livenet' | 'testnet') => Promise<void>;
    getNetwork: () => Promise<Network>;
    getPublicKey: () => Promise<string>;
    getBalance: () => Promise<Balance>;
    sendBitcoin: (address: string, atomicAmount: number, options?: {
        feeRate: number;
    }) => Promise<string>;
    signPsbt: (psbtHex: string, options?: {
        autoFinalized?: boolean;
        toSignInputs: {
            index: number;
            address?: string;
            publicKey?: string;
            sighashTypes?: number[];
            disableTweakSigner?: boolean;
        }[];
    }) => Promise<string>;
};
declare global {
    interface Window {
        unisat: Unisat;
    }
}
declare class UnisatConnector extends SatsConnector {
    id: string;
    name: string;
    homepage: string;
    constructor(network: WalletNetwork);
    connect(): Promise<void>;
    disconnect(): void;
    changeAccount([account]: string[]): Promise<void>;
    isReady(): Promise<boolean>;
    sendToAddress(toAddress: string, amount: number): Promise<string>;
    signInput(inputIndex: number, psbt: Psbt): Promise<Psbt>;
    sendInscription(address: string, inscriptionId: string, feeRate?: number): Promise<string>;
}

interface ExtendedPublicKey {
    xpub: string;
    mfp: string;
}
declare global {
    interface Window {
        readonly ethereum: MetaMaskInpageProvider;
    }
}
declare class MMSnapConnector extends SatsConnector {
    id: string;
    name: string;
    homepage: string;
    extendedPublicKey: ExtendedPublicKey | undefined;
    snapNetwork: 'main' | 'test';
    constructor(network: WalletNetwork);
    connect(): Promise<void>;
    isReady(): Promise<boolean>;
    getExtendedPublicKey(): Promise<ExtendedPublicKey>;
    getPublicKey(): Promise<string>;
    sendToAddress(toAddress: string, amount: number): Promise<string>;
    sendInscription(address: string, inscriptionId: string, feeRate?: number): Promise<string>;
    signInput(inputIndex: number, psbt: Psbt): Promise<bitcoin.Psbt>;
    getMasterFingerprint(): Promise<_metamask_providers_dist_utils.Maybe<unknown>>;
    signPsbt(base64Psbt: string, scriptType: BitcoinScriptType): Promise<{
        txId: string;
        txHex: string;
    }>;
    updateNetworkInSnap(): Promise<_metamask_providers_dist_utils.Maybe<unknown>>;
}

type AddressType = 'p2tr' | 'p2wpkh' | 'p2sh' | 'ethereum' | 'unknown';
type AddressResult = {
    address: string;
    publicKey?: string;
    tweakedPublicKey?: string;
    derivationPath?: string;
    isTestnet?: boolean;
    type: AddressType;
};
interface SignPsbtRequestParams {
    psbt: string;
    allowedSighash?: any[];
    signAtIndex: number | number[];
    network: any;
    account: string;
    broadcast?: boolean;
}
type RequestAddressesResult = {
    result: {
        addresses: AddressResult[];
    };
};
type RequestAddressesFn = (method: 'getAddresses') => Promise<RequestAddressesResult>;
type RecipientParam = {
    address: string;
    amount: string;
};
type SendBTCFn = (method: 'sendTransfer', options: {
    account: string;
    recipients: RecipientParam[];
    network: WalletNetwork;
}) => Promise<string>;
type SignPsbtFn = (method: 'signPsbt', options: SignPsbtRequestParams) => Promise<{
    psbt: string;
    txid?: string;
}>;
declare global {
    interface Window {
        OpenBitProvider: {
            request: RequestAddressesFn & SendBTCFn & SignPsbtFn;
        };
    }
}
declare class OpenBitConnector extends SatsConnector {
    id: string;
    name: string;
    homepage: string;
    constructor(network: WalletNetwork);
    connect(): Promise<void>;
    isReady(): Promise<boolean>;
    sendToAddress(toAddress: string, amount: number): Promise<string>;
    signInput(inputIndex: number, psbt: Psbt): Promise<Psbt>;
}

export { LeatherConnector, MMSnapConnector, OpenBitConnector, SatsConnector, SatsWagmiConfig, UnisatConnector, XverseConnector, useAccount, useConnect, useDisconnect, useSatsWagmi };
