const fs = require('fs');
const file = 'components/WhaleTable.tsx';
let data = fs.readFileSync(file, 'utf8');

if (!data.includes('lucide-react')) {
  data = data.replace(
    'import Link from "next/link";',
    'import Link from "next/link";\nimport { Star, Trash2 } from "lucide-react";'
  );
}

// Add onToggleFavorite to props
data = data.replace(
  'onRemoveWatchlist: (address: string) => void;',
  'onRemoveWatchlist: (address: string) => void;\n  onToggleFavorite?: (address: string, label: string) => void;'
);

data = data.replace(
  '  lastActivity,\n}: WhaleTableProps) {',
  '  lastActivity,\n  onToggleFavorite,\n}: WhaleTableProps) {'
);

// We need to render the Favorite button in renderRow next to the address
// Find where the last Activity cell is and add the Star before the Trash

const lastCellTarget = `{lastActivity[address] ? timeAgo(lastActivity[address]) : "—"}`;
const newLastCell = `{lastActivity[address] ? timeAgo(lastActivity[address]) : "—"}
          {isHovered && !isCustom && onToggleFavorite && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(address, label); }}
              title={watchlist.some(w => w.address === address) ? "Remove Favorite" : "Add Favorite"}
              style={{
                float: "right",
                width: 20,
                height: 20,
                marginLeft: 8,
                borderRadius: 4,
                border: "none",
                backgroundColor: "transparent",
                color: watchlist.some(w => w.address === address) ? "var(--amber)" : "var(--text-3)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Star size={14} fill={watchlist.some(w => w.address === address) ? "var(--amber)" : "none"} />
            </button>
          )}
          {isCustom && isHovered && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemoveWatchlist(address); }}
              title="Remove"
              style={{
                float: "right",
                width: 20,
                height: 20,
                marginLeft: 8,
                borderRadius: 4,
                border: "none",
                backgroundColor: "var(--red-bg)",
                color: "var(--red)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Trash2 size={14} />
            </button>
          )}`;

data = data.replace(
  /\{lastActivity\[address\] \? timeAgo\(lastActivity\[address\]\) : "—"\}[\s\S]*?<\/button>\s*\)\}/,
  newLastCell
);

fs.writeFileSync(file, data);
