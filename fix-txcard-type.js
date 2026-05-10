const fs = require('fs');
const file = 'components/TransactionCard.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace('function getExtraTag(label) {', 'function getExtraTag(label: string | null | undefined) {');

fs.writeFileSync(file, data);
