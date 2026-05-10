const fs = require('fs');
const file = 'components/Header.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  '<div className="pulse-green" style={{ width: 6, height: 6, backgroundColor: "var(--green)", borderRadius: "50%" }} />\n            <span className="mono hide-on-mobile" style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500 }}>\n              Updates every 60s\n            </span>',
  '<div className="pulse-green" style={{ width: 8, height: 8, backgroundColor: "var(--green)", borderRadius: "50%", boxShadow: "0 0 8px var(--green)" }} />\n            <span className="mono hide-on-mobile" style={{ fontSize: 11, color: "var(--green)", fontWeight: 700, letterSpacing: "0.05em" }}>\n              LIVE SIGNAL\n            </span>'
);

fs.writeFileSync(file, data);
