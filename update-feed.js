const fs = require('fs');
const file = 'components/TransactionFeed.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  /onStatsUpdate\?: \(\n    txCount: number,\n    largestMove: number,\n    largestToken: string,?\n  \) => void;/,
  `onStatsUpdate?: (
    txCount: number,
    largestMove: number,
    largestToken: string,
    largestAddress: string,
    largestLabel: string
  ) => void;`
);

data = data.replace(
  'onStatsUpdate(data.length, biggest.usdValue, biggest.tokenSymbol);',
  'onStatsUpdate(data.length, biggest.usdValue, biggest.tokenSymbol, biggest.walletAddress, biggest.walletLabel);'
);

data = data.replace(
  'onStatsUpdate(fresh.length, biggest.usdValue, biggest.tokenSymbol);',
  'onStatsUpdate(fresh.length, biggest.usdValue, biggest.tokenSymbol, biggest.walletAddress, biggest.walletLabel);'
);

data = data.replace(
  'onStatsUpdate(fallbackMockData.length, fallbackMockData[0].usdValue, fallbackMockData[0].tokenSymbol);',
  'onStatsUpdate(fallbackMockData.length, fallbackMockData[0].usdValue, fallbackMockData[0].tokenSymbol, fallbackMockData[0].walletAddress, fallbackMockData[0].walletLabel);'
);

fs.writeFileSync(file, data);
