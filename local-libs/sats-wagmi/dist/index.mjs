"use client";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/provider.tsx
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@gobob/react-query";

// src/connectors/xverse.ts
import { Psbt as Psbt2 } from "bitcoinjs-lib";
import {
  AddressPurpose,
  BitcoinNetworkType,
  createInscription,
  getAddress,
  sendBtcTransaction,
  signTransaction
} from "sats-connect";
import { isValidBTCAddress } from "@gobob/utils";

// src/connectors/base.ts
import { DefaultElectrsClient, createTextInscription, inscribeData } from "@gobob/bob-sdk";
import { Psbt, Transaction, networks } from "bitcoinjs-lib";
import retry from "async-retry";
import { createImageInscription, estimateTxSize, findUtxoForInscriptionId } from "@gobob/utils";
var toXOnly = (pubKey) => pubKey.length === 32 ? pubKey : pubKey.subarray(1, 33);
var SatsConnector = class {
  constructor(network) {
    /** Whether connector is usable */
    __publicField(this, "ready", false);
    __publicField(this, "address", "");
    __publicField(this, "publicKey");
    __publicField(this, "network");
    this.network = network;
  }
  disconnect() {
    this.address = void 0;
    this.publicKey = void 0;
  }
  getAccount() {
    return this.address;
  }
  isAuthorized() {
    const address = this.getAccount();
    return !!address;
  }
  // Get bitcoinlib-js network
  async getNetwork() {
    switch (this.network) {
      case "mainnet":
        return networks.bitcoin;
      case "testnet":
        return networks.testnet;
      default:
        throw new Error("Unknown network");
    }
  }
  async getPublicKey() {
    if (!this.publicKey) {
      throw new Error("Something went wrong while connecting");
    }
    return this.publicKey;
  }
  async sendInscription(address, inscriptionId, feeRate = 1) {
    if (!this.address || !this.publicKey) {
      throw new Error("Connect wallet");
    }
    const network = await this.getNetwork();
    const electrsClient = new DefaultElectrsClient(this.network);
    const utxos = await electrsClient.getAddressUtxos(this.address);
    const inscriptionUtxo = await findUtxoForInscriptionId(electrsClient, utxos, inscriptionId);
    if (inscriptionUtxo === void 0) {
      throw Error(
        `Unable to find utxo owned by address [${this.address}] containing inscription id [${inscriptionId}]`
      );
    }
    const txHex = await electrsClient.getTransactionHex(inscriptionUtxo.txid);
    const utx = Transaction.fromHex(txHex);
    const witnessUtxo = {
      script: utx.outs[inscriptionUtxo.vout].script,
      value: inscriptionUtxo.value
    };
    const nonWitnessUtxo = utx.toBuffer();
    let psbt = new Psbt({
      network
    });
    psbt.addInput({
      hash: inscriptionUtxo.txid,
      index: inscriptionUtxo.vout,
      witnessUtxo,
      nonWitnessUtxo,
      tapInternalKey: toXOnly(Buffer.from(this.publicKey, "hex"))
    });
    const txSize = estimateTxSize(network, address);
    const fee = txSize * feeRate;
    psbt.addOutput({
      address,
      value: inscriptionUtxo.value - fee
    });
    psbt = await this.signInput(0, psbt);
    psbt.finalizeAllInputs();
    return electrsClient.broadcastTx(psbt.extractTransaction().toHex());
  }
  async getTransaction(txId) {
    const electrsClient = new DefaultElectrsClient(this.network);
    return retry(
      async (bail) => {
        const txHex = await electrsClient.getTransactionHex(txId);
        if (!txHex) {
          bail(new Error("Failed"));
        }
        return Transaction.fromHex(txHex);
      },
      {
        retries: 20,
        minTimeout: 2e3,
        maxTimeout: 5e3
      }
    );
  }
  async inscribe(contentType, content) {
    if (!this.address) {
      throw new Error("Something went wrong while connecting");
    }
    const electrsClient = new DefaultElectrsClient(this.network);
    let inscription;
    if (contentType === "image") {
      const buffer = Buffer.from(content, "base64");
      inscription = createImageInscription(buffer);
    } else {
      inscription = createTextInscription(content);
    }
    const feeRate = await electrsClient.getFeeEstimate(6);
    const inscribeTx = await inscribeData(this.getSigner(), this.address, feeRate, inscription);
    return electrsClient.broadcastTx(inscribeTx.toHex());
  }
  // lib needs this signer
  getSigner() {
    return this;
  }
};

// src/connectors/xverse.ts
var getWalletNetwork = (network) => ({
  type: network === "mainnet" ? BitcoinNetworkType.Mainnet : BitcoinNetworkType.Testnet
});
var XverseConnector = class extends SatsConnector {
  constructor(network) {
    super(network);
    __publicField(this, "id", "xverse");
    __publicField(this, "name", "Xverse");
    __publicField(this, "homepage", "https://www.xverse.app/");
    // Needed for sendBtcTransaction function
    __publicField(this, "paymentAddress");
  }
  async connect() {
    return new Promise(async (resolve, reject) => {
      await getAddress({
        payload: {
          purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
          message: "Address for receiving Ordinals and payments",
          network: getWalletNetwork(this.network)
        },
        onFinish: (res) => {
          const { address, publicKey } = res.addresses.find(
            (address2) => address2.purpose === AddressPurpose.Ordinals
          );
          const { address: paymentAddress } = res.addresses.find(
            (address2) => address2.purpose === AddressPurpose.Payment
          );
          if (!isValidBTCAddress(this.network, address)) {
            throw new Error(`Invalid Network. Please switch to bitcoin ${this.network}.`);
          }
          this.address = address;
          this.paymentAddress = paymentAddress;
          this.publicKey = publicKey;
          resolve();
        },
        onCancel: () => {
          reject(new Error("User rejected connect"));
        }
      });
    });
  }
  async isReady() {
    this.ready = !!window.XverseProviders;
    return this.ready;
  }
  async sendToAddress(toAddress, amount) {
    return new Promise(async (resolve, reject) => {
      if (!this.address || !this.paymentAddress) {
        return reject(new Error("Something went wrong while connecting"));
      }
      await sendBtcTransaction({
        payload: {
          network: getWalletNetwork(this.network),
          recipients: [{ address: toAddress, amountSats: BigInt(amount) }],
          senderAddress: this.paymentAddress
        },
        onFinish: (response) => {
          resolve(response);
        },
        onCancel: () => {
          reject(new Error("Send BTC Transaction canceled"));
        }
      });
    });
  }
  async inscribe(contentType, content) {
    return new Promise(async (resolve, reject) => {
      await createInscription({
        payload: {
          network: getWalletNetwork(this.network),
          content,
          contentType: contentType === "text" ? "text/plain;charset=utf-8" : "image/jpeg",
          payloadType: contentType === "text" ? "PLAIN_TEXT" : "BASE_64"
        },
        onFinish: (response) => {
          resolve(response.txId);
        },
        onCancel: () => reject(new Error("Canceled"))
      });
    });
  }
  async signInput(inputIndex, psbt) {
    return new Promise(async (resolve, reject) => {
      if (!this.address) {
        return reject(new Error("Something went wrong while connecting"));
      }
      await signTransaction({
        payload: {
          network: getWalletNetwork(this.network),
          message: "Sign Transaction",
          psbtBase64: psbt.toBase64(),
          broadcast: false,
          inputsToSign: [
            {
              address: this.address,
              signingIndexes: [inputIndex]
            }
          ]
        },
        onFinish: (response) => {
          resolve(Psbt2.fromBase64(response.psbtBase64));
        },
        onCancel: () => reject(new Error("Canceled"))
      });
    });
  }
};

// src/connectors/leather.ts
import { Psbt as Psbt3 } from "bitcoinjs-lib";
import { isValidBTCAddress as isValidBTCAddress2 } from "@gobob/utils";
var LeatherConnector = class extends SatsConnector {
  constructor(network) {
    super(network);
    __publicField(this, "id", "leather");
    __publicField(this, "name", "Leather");
    __publicField(this, "homepage", "https://leather.io/");
    __publicField(this, "derivationPath");
  }
  async connect() {
    const userAddresses = await window.btc.request("getAddresses");
    const account = userAddresses.result.addresses.find((el) => el.type === "p2tr");
    if (!account) {
      throw new Error("Failed to connect wallet");
    }
    if (!isValidBTCAddress2(this.network, account.address)) {
      throw new Error(`Invalid Network. Please switch to bitcoin ${this.network}.`);
    }
    this.address = account.address;
    this.publicKey = account.publicKey;
    this.derivationPath = account.derivationPath;
  }
  async isReady() {
    this.ready = !!window.LeatherProvider;
    return this.ready;
  }
  async sendToAddress(toAddress, amount) {
    const resp = await window.btc.request("sendTransfer", {
      address: toAddress,
      amount: amount.toString(),
      network: this.network
    });
    return resp.result.txid;
  }
  async signInput(inputIndex, psbt) {
    const response = await window.btc.request("signPsbt", {
      hex: psbt.toHex(),
      signAtIndex: inputIndex,
      // account: extractAccountNumber(this.derivationPath as string),
      network: this.network,
      broadcast: false
    });
    return Psbt3.fromHex(response.result.hex);
  }
};

// src/connectors/unisat.ts
import { Psbt as Psbt4 } from "bitcoinjs-lib";
var getLibNetwork = (network) => {
  switch (network) {
    case "livenet":
      return "mainnet";
    case "testnet":
      return "testnet";
  }
};
var getUnisatNetwork = (network) => {
  switch (network) {
    default:
    case "mainnet":
      return "testnet";
    case "testnet":
      return "testnet";
  }
};
var UnisatConnector = class extends SatsConnector {
  constructor(network) {
    super(network);
    __publicField(this, "id", "unisat");
    __publicField(this, "name", "Unisat");
    __publicField(this, "homepage", "https://unisat.io/");
  }
  async connect() {
    const network = await window.unisat.getNetwork();
    const mappedNetwork = getLibNetwork(network);
    if (mappedNetwork !== this.network) {
      const expectedNetwork = getUnisatNetwork(this.network);
      await window.unisat.switchNetwork(expectedNetwork);
    }
    const [accounts, publickKey] = await Promise.all([window.unisat.requestAccounts(), window.unisat.getPublicKey()]);
    this.address = accounts[0];
    this.publicKey = publickKey;
    window.unisat.on("accountsChanged", this.changeAccount);
  }
  disconnect() {
    this.address = void 0;
    this.publicKey = void 0;
    window.unisat.removeListener("accountsChanged", this.changeAccount);
  }
  async changeAccount([account]) {
    this.address = account;
    this.publicKey = await window.unisat.getPublicKey();
  }
  async isReady() {
    this.ready = typeof window.unisat !== "undefined";
    return this.ready;
  }
  async sendToAddress(toAddress, amount) {
    return window.unisat.sendBitcoin(toAddress, amount);
  }
  async signInput(inputIndex, psbt) {
    const publicKey = await this.getPublicKey();
    const psbtHex = await window.unisat.signPsbt(psbt.toHex(), {
      autoFinalized: false,
      toSignInputs: [
        {
          index: inputIndex,
          publicKey,
          disableTweakSigner: true
        }
      ]
    });
    return Psbt4.fromHex(psbtHex);
  }
  async sendInscription(address, inscriptionId, feeRate) {
    return (await window.unisat.sendInscription(address, inscriptionId, feeRate ? { feeRate } : void 0)).txid;
  }
};

// src/connectors/mm-snap.ts
import * as ecc from "@bitcoin-js/tiny-secp256k1-asmjs";
import { DefaultElectrsClient as DefaultElectrsClient2 } from "@gobob/bob-sdk";
import { BIP32Factory } from "bip32";
import * as bitcoin from "bitcoinjs-lib";
import bs58check from "bs58check";
import { estimateTxSize as estimateTxSize2, findUtxoForInscriptionId as findUtxoForInscriptionId2, findUtxosWithoutInscriptions } from "@gobob/utils";
import coinSelect from "coinselect";

// src/utils/metamask.ts
var PsbtValidateErrors = [
  {
    code: 10001,
    name: "InputsDataInsufficient",
    message: "Not all inputs have prev Tx raw hex"
  },
  {
    code: 10002,
    name: "InputsNetworkNotMatch",
    message: "Not every input matches network"
  },
  {
    code: 10003,
    name: "OutputsNetworkNotMatch",
    message: "Not every input matches network"
  },
  {
    code: 10004,
    name: "InputNotSpendable",
    message: "Not all inputs belongs to current account"
  },
  {
    code: 10005,
    name: "ChangeAddressInvalid",
    message: "Change address doesn't belongs to current account"
  },
  {
    code: 10006,
    name: "FeeTooHigh",
    message: "Too much fee"
  },
  {
    code: 10007,
    name: "AmountNotMatch",
    message: "Transaction input amount not match"
  }
];
var SnapRequestErrors = [
  {
    code: 2e4,
    name: "NoPermission",
    message: "Unauthorized to perform action."
  },
  {
    code: 20001,
    name: "RejectKey",
    message: "User reject to access the key"
  },
  {
    code: 20002,
    name: "RejectSign",
    message: "User reject the sign request"
  },
  {
    code: 20003,
    name: "SignInvalidPath",
    message: "invalid path"
  },
  {
    code: 20004,
    name: "SignFailed",
    message: "Sign transaction failed"
  },
  {
    code: 20005,
    name: "NetworkNotMatch",
    message: "Network not match"
  },
  {
    code: 20006,
    name: "ScriptTypeNotSupport",
    message: "ScriptType is not supported."
  },
  {
    code: 20007,
    name: "MethodNotSupport",
    message: "Method not found."
  },
  {
    code: 20008,
    name: "ActionNotSupport",
    message: "Action not supported"
  },
  {
    code: 20009,
    name: "UserReject",
    message: "User rejected the request."
  }
];
var BaseError = class extends Error {
  constructor(code) {
    super();
    __publicField(this, "code");
    __publicField(this, "resolve", (fn) => {
      fn();
    });
    this.code = code;
  }
};
var SnapError = class extends BaseError {
  constructor(message) {
    const userFriendlyError = mapErrorToUserFriendlyError(message);
    super(userFriendlyError.code);
    this.name = userFriendlyError.name;
    this.message = userFriendlyError.message;
  }
};
var mapErrorToUserFriendlyError = (message) => {
  const psbtValidateError = PsbtValidateErrors.find((item) => message.startsWith(item.message));
  const snapRequestError = SnapRequestErrors.find((item) => message.startsWith(item.message));
  if (psbtValidateError) {
    switch (psbtValidateError.name) {
      case "FeeTooHigh":
        return { ...psbtValidateError, message: "Fee too high" };
      default:
        return { ...psbtValidateError, message: "Transaction is invalid" };
    }
  }
  if (snapRequestError) {
    switch (snapRequestError.name) {
      case "NoPermission":
        return {
          ...snapRequestError,
          message: "This error is usually caused by resetting the recovery phrase, please try to reinstall MetaMask"
        };
      case "SignInvalidPath":
        return { ...snapRequestError, message: "Sign transaction failed" };
      case "ScriptTypeNotSupport":
      case "MethodNotSupport":
      case "ActionNotSupport":
        return { ...snapRequestError, message: "Request error" };
      default:
        return snapRequestError;
    }
  }
  return { message, code: 0, name: "UnknownSnapError" };
};

// src/connectors/mm-snap.ts
var getSnapNetwork = (network) => {
  switch (network) {
    default:
    case "mainnet":
      return "main";
    case "testnet":
      return "test";
  }
};
bitcoin.initEccLib(ecc);
var bip32 = BIP32Factory(ecc);
function anyPubToXpub(xyzpub, network) {
  let data = bs58check.decode(xyzpub);
  data = data.subarray(4);
  const tpubPrefix = "043587cf";
  const xpubPrefix = "0488b21e";
  const prefix = network === bitcoin.networks.testnet ? tpubPrefix : xpubPrefix;
  data = Buffer.concat([Buffer.from(prefix, "hex"), data]);
  return bs58check.encode(data);
}
function addressFromExtPubKey(xyzpub, network) {
  const forcedXpub = anyPubToXpub(xyzpub, network);
  const pubkey = bip32.fromBase58(forcedXpub, network).derive(0).derive(0).publicKey;
  return bitcoin.payments.p2wpkh({ pubkey, network }).address;
}
var DEFAULT_BIP32_PATH = "m/84'/1'/0'/0/0";
var hardcodedScriptType = "P2WPKH" /* P2WPKH */;
var { ethereum } = window;
var snapId = "npm:@gobob/bob-snap";
var MMSnapConnector = class extends SatsConnector {
  constructor(network) {
    super(network);
    __publicField(this, "id", "metamask_snap");
    __publicField(this, "name", "MetaMask");
    // TODO: add when snap is published
    __publicField(this, "homepage", "https://metamask.io/snaps/");
    __publicField(this, "extendedPublicKey");
    __publicField(this, "snapNetwork", "main");
  }
  async connect() {
    var _a, _b;
    this.snapNetwork = getSnapNetwork(this.network);
    try {
      const result = await ethereum.request({
        method: "wallet_requestSnaps",
        params: {
          [snapId]: {}
        }
      });
      const hasError = !!((_b = (_a = result == null ? void 0 : result.snaps) == null ? void 0 : _a[snapId]) == null ? void 0 : _b.error);
      if (hasError) {
        throw new Error("Failed Connect");
      }
    } finally {
      if (this.snapNetwork === "test") {
        await this.updateNetworkInSnap();
      }
      this.extendedPublicKey = await this.getExtendedPublicKey();
      this.publicKey = await this.getPublicKey();
      this.address = addressFromExtPubKey(this.extendedPublicKey.xpub, await this.getNetwork());
    }
  }
  async isReady() {
    const snaps = await ethereum.request({
      method: "wallet_getSnaps"
    });
    return Object.keys(snaps || {}).includes(snapId);
  }
  async getExtendedPublicKey() {
    if (this.extendedPublicKey) {
      return this.extendedPublicKey;
    }
    try {
      return await ethereum.request({
        method: "wallet_invokeSnap",
        params: {
          snapId,
          request: {
            method: "btc_getPublicExtendedKey",
            params: {
              network: this.snapNetwork,
              scriptType: "P2WPKH" /* P2WPKH */
            }
          }
        }
      });
    } catch (err) {
      const error = new SnapError((err == null ? void 0 : err.message) || "Get extended public key failed");
      throw error;
    }
  }
  async getPublicKey() {
    if (!this.extendedPublicKey) {
      throw new Error("Something wrong with connect");
    }
    const network = await this.getNetwork();
    const forcedXpub = anyPubToXpub(this.extendedPublicKey.xpub, await this.getNetwork());
    const pubkey = bip32.fromBase58(forcedXpub, network).derive(0).derive(0).publicKey;
    return pubkey.toString("hex");
  }
  async sendToAddress(toAddress, amount) {
    if (!this.publicKey) {
      throw new Error("Public key missing");
    }
    const electrsClient = new DefaultElectrsClient2(this.network);
    const libNetwork = await this.getNetwork();
    const senderPubKey = Buffer.from(this.publicKey, "hex");
    const senderAddress = bitcoin.payments.p2wpkh({
      pubkey: senderPubKey,
      network: libNetwork
    }).address;
    const txOutputs = [
      {
        address: toAddress,
        value: amount
      }
    ];
    const allConfirmedUtxos = await electrsClient.getAddressUtxos(senderAddress);
    const utxos = await findUtxosWithoutInscriptions(electrsClient, allConfirmedUtxos);
    const { inputs, outputs } = coinSelect(
      utxos.map((utxo) => {
        return {
          txId: utxo.txid,
          vout: utxo.vout,
          value: utxo.value
        };
      }),
      txOutputs,
      1
      // fee rate
    );
    if (!inputs || !outputs) {
      throw Error("Please make sure you gave enough funds");
    }
    const psbt = new bitcoin.Psbt({ network: libNetwork });
    for (const input of inputs) {
      const txHex = await electrsClient.getTransactionHex(input.txId);
      const utx = bitcoin.Transaction.fromHex(txHex);
      const witnessUtxo = {
        script: utx.outs[input.vout].script,
        value: input.value
      };
      const nonWitnessUtxo = utx.toBuffer();
      psbt.addInput({
        hash: input.txId,
        index: input.vout,
        nonWitnessUtxo,
        witnessUtxo,
        bip32Derivation: [
          {
            masterFingerprint: Buffer.from(await this.getMasterFingerprint(), "hex"),
            path: DEFAULT_BIP32_PATH,
            pubkey: senderPubKey
          }
        ]
      });
    }
    const changeAddress = senderAddress;
    outputs.forEach((output) => {
      if (!output.address) {
        output.address = changeAddress;
      }
      psbt.addOutput({
        address: output.address,
        value: output.value
      });
    });
    const txResult = await this.signPsbt(psbt.toBase64(), hardcodedScriptType);
    return electrsClient.broadcastTx(txResult.txHex);
  }
  async sendInscription(address, inscriptionId, feeRate = 1) {
    if (!this.publicKey) {
      throw new Error("Connect failed");
    }
    const pubkey = Buffer.from(await this.publicKey, "hex");
    const libNetwork = await this.getNetwork();
    const senderAddress = bitcoin.payments.p2wpkh({ pubkey, network: libNetwork }).address;
    const electrsClient = new DefaultElectrsClient2(this.network);
    const utxos = await electrsClient.getAddressUtxos(senderAddress);
    const inscriptionUtxo = await findUtxoForInscriptionId2(electrsClient, utxos, inscriptionId);
    if (inscriptionUtxo === void 0) {
      throw Error(
        `Unable to find utxo owned by address [${senderAddress}] containing inscription id [${inscriptionId}]`
      );
    }
    const psbt = new bitcoin.Psbt({ network: libNetwork });
    const txHex = await electrsClient.getTransactionHex(inscriptionUtxo.txid);
    const utx = bitcoin.Transaction.fromHex(txHex);
    const witnessUtxo = {
      script: utx.outs[inscriptionUtxo.vout].script,
      value: inscriptionUtxo.value
    };
    const nonWitnessUtxo = utx.toBuffer();
    const masterFingerprint = Buffer.from(await this.getMasterFingerprint(), "hex");
    psbt.addInput({
      hash: inscriptionUtxo.txid,
      index: inscriptionUtxo.vout,
      nonWitnessUtxo,
      witnessUtxo,
      bip32Derivation: [
        {
          masterFingerprint,
          path: DEFAULT_BIP32_PATH,
          pubkey
        }
      ]
    });
    const txSize = estimateTxSize2(libNetwork, address);
    const fee = txSize * feeRate;
    psbt.addOutput({
      address,
      value: inscriptionUtxo.value - fee
    });
    const txResult = await this.signPsbt(psbt.toBase64(), hardcodedScriptType);
    return electrsClient.broadcastTx(txResult.txHex);
  }
  async signInput(inputIndex, psbt) {
    try {
      const psbtBase64 = await ethereum.request({
        method: "wallet_invokeSnap",
        params: {
          snapId,
          request: {
            method: "btc_signInput",
            params: {
              psbt: psbt.toBase64(),
              network: this.snapNetwork,
              scriptType: "P2WPKH" /* P2WPKH */,
              inputIndex,
              path: DEFAULT_BIP32_PATH
            }
          }
        }
      });
      if (!psbtBase64) {
        throw new Error("");
      }
      return bitcoin.Psbt.fromBase64(psbtBase64);
    } catch (err) {
      const error = new SnapError((err == null ? void 0 : err.message) || "Sign Input failed");
      throw error;
    }
  }
  async getMasterFingerprint() {
    try {
      return await ethereum.request({
        method: "wallet_invokeSnap",
        params: {
          snapId,
          request: {
            method: "btc_getMasterFingerprint"
          }
        }
      });
    } catch (err) {
      const error = new SnapError((err == null ? void 0 : err.message) || "Snap get master fingerprint failed");
      throw error;
    }
  }
  async signPsbt(base64Psbt, scriptType) {
    try {
      return await ethereum.request({
        method: "wallet_invokeSnap",
        params: {
          snapId,
          request: {
            method: "btc_signPsbt",
            params: {
              psbt: base64Psbt,
              network: this.snapNetwork,
              scriptType
            }
          }
        }
      });
    } catch (err) {
      const error = new SnapError((err == null ? void 0 : err.message) || "Sign PSBT failed");
      throw error;
    }
  }
  async updateNetworkInSnap() {
    try {
      return await ethereum.request({
        method: "wallet_invokeSnap",
        params: {
          snapId,
          request: {
            method: "btc_network",
            params: {
              action: "set",
              network: this.snapNetwork
            }
          }
        }
      });
    } catch (err) {
      const error = new SnapError((err == null ? void 0 : err.message) || "Snap set Network failed");
      throw error;
    }
  }
};

// src/connectors/openbit.ts
import { Psbt as Psbt6 } from "bitcoinjs-lib";
import { isValidBTCAddress as isValidBTCAddress3 } from "@gobob/utils";
var OpenBitConnector = class extends SatsConnector {
  constructor(network) {
    super(network);
    __publicField(this, "id", "openBit");
    __publicField(this, "name", "OpenBit");
    __publicField(this, "homepage", "https://docs.openbit.app/");
    __publicField(this, "derivationPath");
    __publicField(this, "paymentAddress");
  }
  async connect() {
    return new Promise(async (resolve, reject) => {
      try {
        const addressesResult = await window.OpenBitProvider.request("getAddresses");
        const account = addressesResult.result.addresses.find(
          (el) => el.type === "p2tr" && !!el.isTestnet === (this.network === "testnet")
        );
        const paymentAccount = addressesResult.result.addresses.find(
          (el) => el.type === "p2wpkh" && !!el.isTestnet === (this.network === "testnet")
        );
        if (!account || !paymentAccount) {
          reject(new Error("Failed to connect wallet"));
          return;
        }
        if (!isValidBTCAddress3(this.network, account.address)) {
          reject(new Error(`Invalid Network. Please switch to bitcoin ${this.network}.`));
          return;
        }
        this.address = account.address;
        this.paymentAddress = paymentAccount.address;
        this.publicKey = account.publicKey;
        this.derivationPath = account.derivationPath;
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }
  async isReady() {
    this.ready = !!window.OpenBitProvider;
    return this.ready;
  }
  async sendToAddress(toAddress, amount) {
    await this.connect();
    return new Promise(async (resolve, reject) => {
      if (!this.address) {
        reject(new Error("Something went wrong while connecting"));
        return;
      }
      try {
        const resp = await window.OpenBitProvider.request("sendTransfer", {
          account: this.address,
          recipients: [{ address: toAddress, amount: amount.toString() }],
          network: this.network
        });
        resolve(resp);
      } catch (e) {
        reject(e);
      }
    });
  }
  async signInput(inputIndex, psbt) {
    return new Promise(async (resolve, reject) => {
      if (!this.address) {
        reject(new Error("Something went wrong while connecting"));
        return;
      }
      try {
        const response = await window.OpenBitProvider.request("signPsbt", {
          psbt: psbt.toHex(),
          signAtIndex: inputIndex,
          account: this.address,
          network: this.network,
          broadcast: false
        });
        resolve(Psbt6.fromHex(response.psbt));
      } catch (e) {
        reject(e);
      }
    });
  }
};

// src/provider.tsx
import { jsx } from "react/jsx-runtime";
var StatsWagmiContext = createContext({
  connector: void 0,
  connectors: [],
  setConnector: () => {
  }
});
var useSatsWagmi = () => {
  const context = useContext(StatsWagmiContext);
  if (context === void 0) {
    throw new Error("useSatsWagmi must be used within a SatsWagmiConfig!");
  }
  return context;
};
var SatsWagmiConfig = ({
  children,
  network = "mainnet",
  queryClient = new QueryClient()
}) => {
  const [connectors, setConnectors] = useState([]);
  const [connector, setCurrentConnector] = useState();
  useEffect(() => {
    const init = () => {
      const readyConnectors = [];
      const xverse = new XverseConnector(network);
      readyConnectors.push(xverse);
      const unisat = new UnisatConnector(network);
      readyConnectors.push(unisat);
      const mmSnap = new MMSnapConnector(network);
      mmSnap.connect();
      readyConnectors.push(mmSnap);
      const leather = new LeatherConnector(network);
      readyConnectors.push(leather);
      setConnectors(readyConnectors);
      const openBit = new OpenBitConnector(network);
      readyConnectors.push(openBit);
      setConnectors(readyConnectors);
    };
    init();
  }, []);
  const setConnector = useCallback((connector2) => {
    setCurrentConnector(connector2);
  }, []);
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(StatsWagmiContext.Provider, { value: { connectors, connector, setConnector }, children }) });
};

// src/hooks/useConnect.tsx
import { useMutation } from "@gobob/react-query";
var useConnect = () => {
  const { connectors, setConnector } = useSatsWagmi();
  const { mutate, mutateAsync, ...query } = useMutation({
    mutationKey: ["connect"],
    mutationFn: async ({ connector }) => {
      if (!connector) {
        throw new Error("invalid connector id");
      }
      if (connector.name !== "MetaMask" && !await connector.isReady()) {
        window.open(connector.homepage, "_blank", "noopener");
        throw new Error("Wallet is not installed");
      }
      return connector.connect();
    },
    onSuccess: (_, { connector }) => {
      setConnector(connector);
    }
  });
  return {
    ...query,
    connectors,
    connect: mutate,
    connectAsync: mutateAsync
  };
};

// src/hooks/useAccount.tsx
import { useQuery } from "@gobob/react-query";
var useAccount = () => {
  const { connector } = useSatsWagmi();
  const {
    data: address,
    error,
    isError,
    isLoading,
    isSuccess,
    refetch
  } = useQuery({
    queryKey: ["account", connector],
    queryFn: () => {
      if (!connector)
        return void 0;
      return connector == null ? void 0 : connector.getAccount();
    },
    enabled: !!connector
  });
  return {
    connector,
    address,
    error,
    isError,
    isLoading,
    isSuccess,
    refetch
  };
};

// src/hooks/useDisconnect.tsx
import { useMutation as useMutation2 } from "@gobob/react-query";
var useDisconnect = () => {
  const { setConnector } = useSatsWagmi();
  const { mutate, mutateAsync, ...mutation } = useMutation2({
    mutationKey: ["disconnect"],
    mutationFn: async () => {
      setConnector(void 0);
    }
  });
  return {
    ...mutation,
    disconnect: mutate,
    disconnectAsync: mutateAsync
  };
};
export {
  LeatherConnector,
  MMSnapConnector,
  OpenBitConnector,
  SatsConnector,
  SatsWagmiConfig,
  UnisatConnector,
  XverseConnector,
  useAccount,
  useConnect,
  useDisconnect,
  useSatsWagmi
};
