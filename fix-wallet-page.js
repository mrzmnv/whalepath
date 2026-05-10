const fs = require('fs');
const file = 'app/(main)/wallet/[address]/page.tsx';
let data = fs.readFileSync(file, 'utf8');

// The handleToggleWatch logic needs to toggle the same way page.tsx does.
const toggleFunctionReplacement = `  const handleToggleWatch = useCallback(async () => {
    const label = displayLabel || address.slice(0,8);
    const isLocal = !document.cookie.includes('session');
    
    if (isLocal) {
      if (isWatched) {
        setWatchlist(removeFromWatchlist(address));
        setIsWatched(false);
      } else {
        setWatchlist(addToWatchlist({ address, label, type: 'favorite', addedAt: Date.now(), id: Math.random().toString() }));
        setIsWatched(true);
      }
      return;
    }

    try {
      const res = await fetch('/api/watchlist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, label })
      });
      if (res.ok) {
        setIsWatched(!isWatched);
      }
    } catch (e) {
      console.error(e);
    }
  }, [isWatched, address, displayLabel]);`;


data = data.replace(
  /  const handleToggleWatch = useCallback\(\(\) => \{\n    if \(isWatched\) \{ setWatchlist\(removeFromWatchlist\(address\)\); setIsWatched\(false\); \}\n    else setAddModalOpen\(true\);\n  \}, \[isWatched, address\]\);/,
  toggleFunctionReplacement
);

// We can also remove AddWalletModal from rendering since it's no longer used, or leave it. Leaving it is harmless but let's hide it.
data = data.replace(
  /<AddWalletModal open=\{addModalOpen\} onClose=\{\(\) => setAddModalOpen\(false\)\} onAdd=\{handleAddWallet\} existingAddresses=\{watchlist\.map\(\(w\) => w\.address\)\} \/>/,
  ''
);

fs.writeFileSync(file, data);
