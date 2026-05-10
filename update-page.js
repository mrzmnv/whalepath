const fs = require('fs');
const file = 'app/(main)/page.tsx';
let data = fs.readFileSync(file, 'utf8');

const reloadWatchlistFunc = `  const reloadWatchlist = useCallback(() => {
    fetch('/api/watchlist')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.authenticated && data?.items) {
          const formatted = data.items.map((item: any) => ({
            id: item.id,
            address: item.address,
            label: item.label,
            type: item.type,
            addedAt: new Date(item.createdAt).getTime()
          }));
          setWatchlist(formatted);
        } else {
          setWatchlist(getWatchlist());
        }
      })
      .catch(() => {
        setWatchlist(getWatchlist());
      });
  }, []);

  const handleToggleFavorite = useCallback(async (address: string, label: string) => {
    const isLocal = !document.cookie.includes('session');
    if (isLocal) {
      // Local storage fallback
      const current = getWatchlist();
      const existing = current.find(w => w.address === address && w.type === 'favorite');
      if (existing) {
        setWatchlist(removeFromWatchlist(address));
      } else {
        setWatchlist(addToWatchlist({ address, label, type: 'favorite', addedAt: Date.now(), id: Math.random().toString() }));
      }
      return;
    }

    try {
      const res = await fetch('/api/watchlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, label })
      });
      if (res.ok) reloadWatchlist();
    } catch (e) {
      console.error(e);
    }
  }, [reloadWatchlist]);`;

data = data.replace('  const handleAddWallet = useCallback(', reloadWatchlistFunc + '\n\n  const handleAddWallet = useCallback(');

// Also replace the initial fetch
data = data.replace(/    fetch\('\/api\/watchlist'\)[\s\S]*?\.catch\(\(\) => \{\n        setWatchlist\(getWatchlist\(\)\);\n      \}\);/, '    reloadWatchlist();');

// Update WhaleTable props
data = data.replace('onRemoveWatchlist={handleRemoveWatchlist}', 'onRemoveWatchlist={handleRemoveWatchlist}\n              onToggleFavorite={handleToggleFavorite}');

fs.writeFileSync(file, data);
