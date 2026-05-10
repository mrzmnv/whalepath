const fs = require('fs');
const file = 'app/(main)/(user)/profile/page.tsx';
let data = fs.readFileSync(file, 'utf8');

if (!data.includes('lucide-react')) {
  data = `import { LogOut, Plus, Trash2 } from "lucide-react";\n` + data;
}

data = data.replace(/borderRadius: 16/g, 'borderRadius: 12');

fs.writeFileSync(file, data);
