// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

const fs = require('fs');
const { defaults } = require('jest-config');

const config = {
  moduleFileExtensions: [
    ...defaults.moduleFileExtensions,
    'ts',
    'tsx'
  ],
  modulePathIgnorePatterns: ['<rootDir>/build'].concat(
    fs
      .readdirSync('packages')
      .filter((p) => fs.statSync(`packages/${p}`).isDirectory())
      .map((p) => `<rootDir>/packages/${p}/build`)
  ),
  // See https://jestjs.io/docs/configuration#extraglobals-arraystring
  sandboxInjectedGlobals: ['Math'],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': require.resolve('babel-jest')
  }
};

module.exports = {
  ...config,
  modulePathIgnorePatterns: [
    ...config.modulePathIgnorePatterns
  ],
  moduleNameMapper: {
    '@openbit/(dapp-demo)/(.*)$': '<rootDir>/packages/$1/src/$2',
  },
  transform: {
    ...config.transform,
    ".+\\.(svg|css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$": "jest-transform-stub"
  },
  testPathIgnorePatterns: [
    '/node_modules/*'
  ],
  testEnvironment: 'jsdom'
};
