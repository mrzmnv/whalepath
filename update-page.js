const fs = require('fs');
const file = 'app/(main)/page.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  '(txCount: number, largestMove: number, largestToken: string) => {',
  '(txCount: number, largestMove: number, largestToken: string, largestAddress: string, largestLabel: string) => {'
);


data = data.replace(
  /        largestMoveToken:\n          largestMove > s\.largestMoveToday \? largestToken : s\.largestMoveToken,\n      \}\)\);/,
  `        largestMoveToken: largestMove > s.largestMoveToday ? largestToken : s.largestMoveToken,
        largestMoveAddress: largestMove > s.largestMoveToday ? largestAddress : s.largestMoveAddress,
        largestMoveLabel: largestMove > s.largestMoveToday ? largestLabel : s.largestMoveLabel,
      }));`
);

fs.writeFileSync(file, data);
