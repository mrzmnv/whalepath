const fs = require('fs');
const file = 'app/(main)/wallet/[address]/page.tsx';
let data = fs.readFileSync(file, 'utf8');

// I will just use walletInfo?.label directly
data = data.replace(
  'const label = displayLabel || address.slice(0,8);',
  'const label = walletInfo?.label || watchlist.find((w) => w.address === address)?.label || address.slice(0,8);'
);

// update dependencies list
data = data.replace(
  ']}, [isWatched, address, displayLabel]);',
  ']}, [isWatched, address, walletInfo, watchlist]);'
);

data = data.replace('import { useState, useEffect, useCallback } from "react";', 'import { useState, useEffect, useCallback } from "react";\nimport { Star } from "lucide-react";');

// Let's also re-style the button slightly to match other buttons and translate it.
data = data.replace(
  /\{isWatched \? "Unwatch" : "\+ Watch"\}/,
  '{isWatched ? "Unwatch" : "İzləyə Al"}'
);

fs.writeFileSync(file, data);
