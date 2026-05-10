const fs = require('fs');
const file = 'app/(main)/page.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  "    const handleRemoveWatchlist = useCallback((address: string) => {\n      setWatchlist(removeFromWatchlist(address));\n    }, []);",
  ""
);

fs.writeFileSync(file, data);
