const fs = require('fs');
const file = 'app/(main)/wallet/[address]/page.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  '  const [isWatched, setIsWatched] = useState(false);\n  const [addModalOpen, setAddModalOpen] = useState(false);',
  '  const [isWatched, setIsWatched] = useState(false);\n  const [addModalOpen, setAddModalOpen] = useState(false);\n  const [isAuthenticated, setIsAuthenticated] = useState(false);'
);

data = data.replace(
  '    const wl = getWatchlist();\n    setWatchlist(wl);\n    setIsWatched(wl.some((w) => w.address === address));',
  "    fetch('/api/watchlist').then(res => res.ok ? res.json() : null).then(data => {\n      if(data?.authenticated) {\n        setIsAuthenticated(true);\n        setWatchlist(data.items || []);\n        setIsWatched((data.items || []).some((w: any) => w.address === address));\n      } else {\n        const wl = getWatchlist();\n        setWatchlist(wl);\n        setIsWatched(wl.some((w) => w.address === address));\n      }\n    }).catch(() => {\n        const wl = getWatchlist();\n        setWatchlist(wl);\n        setIsWatched(wl.some((w) => w.address === address));\n    });"
);

data = data.replace(
  "    const isLocal = !document.cookie.includes('session');",
  "    const isLocal = !isAuthenticated;"
);

fs.writeFileSync(file, data);
