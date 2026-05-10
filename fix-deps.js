const fs = require('fs');
const file = 'app/(main)/wallet/[address]/page.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  '  }, [isWatched, address, displayLabel]);',
  '  }, [isWatched, address, walletInfo, watchlist]);'
);

fs.writeFileSync(file, data);
