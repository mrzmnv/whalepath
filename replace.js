const fs = require('fs');
const file = 'app/(main)/page.tsx';
let data = fs.readFileSync(file, 'utf8');

const target = `  useEffect(() => {
    setStats((s) => ({ ...s, totalWhales: whalesData.length }));
    setWatchlist(getWatchlist());
  }, []);`;

const replacement = `  useEffect(() => {
    setStats((s) => ({ ...s, totalWhales: whalesData.length }));
    
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
  }, []);`;

data = data.replace(target, replacement);
fs.writeFileSync(file, data);
