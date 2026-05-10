const fs = require('fs');
const file = 'components/TransactionFeed.tsx';
let data = fs.readFileSync(file, 'utf8');

const target = `      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexShrink: 0,
        }}
      >`;

const replacement = `      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexShrink: 0,
          flexWrap: "wrap",
          gap: "12px"
        }}
      >`;

data = data.replace(target, replacement);
fs.writeFileSync(file, data);
