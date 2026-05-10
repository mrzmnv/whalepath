const fs = require('fs');
const file = 'app/(main)/wallet/[address]/page.tsx';
let data = fs.readFileSync(file, 'utf8');

// I also want to match standard borderRadius 4, and add Star icon nicely.
const oldButton = `<button onClick={handleToggleWatch} style={{
                padding: "7px 14px", borderRadius: 8, cursor: "pointer",
                border: \`1px solid \${isWatched ? "rgba(248,113,113,0.3)" : "rgba(99,102,241,0.3)"}\`,
                backgroundColor: isWatched ? "var(--red-bg)" : "var(--surface-3)",
                color: isWatched ? "var(--red)" : "var(--accent)",
                fontSize: 13, fontWeight: 500,
              }}>
                {isWatched ? "Unwatch" : "İzləyə Al"}
              </button>`;
const newButton = `<button onClick={handleToggleWatch} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 4, cursor: "pointer",
                border: \`1px solid \${isWatched ? "rgba(248,113,113,0.3)" : "rgba(99,102,241,0.3)"}\`,
                backgroundColor: isWatched ? "var(--red-bg)" : "var(--surface-3)",
                color: isWatched ? "var(--red)" : "var(--accent)",
                fontSize: 13, fontWeight: 500,
              }}>
                {isWatched ? "✕ İzləmədən çıxar" : <><Star size={14} /> İzləyə Al</>}
              </button>`;

data = data.replace(oldButton, newButton);

fs.writeFileSync(file, data);
