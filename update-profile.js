const fs = require('fs');
const file = 'app/(main)/(user)/profile/page.tsx';
let data = fs.readFileSync(file, 'utf8');

// Replace standard emojis/text with Lucide icons
data = data.replace(/import \{ useState \} from "react";/, `import { useState } from "react";\nimport { LogOut, Plus, Trash2 } from "lucide-react";`);

// Find the logout button
data = data.replace(
  /<button type="submit" style=\{\{ padding: '8px 16px', borderRadius: 8, background: 'var\(--red-bg\)', color: 'var\(--red\)', border: 'none', fontWeight: 600, cursor: 'pointer' \}\}>Logout<\/button>/g,
  `<button type="submit" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 4, background: 'var(--red-bg)', color: 'var(--red)', border: 'none', fontWeight: 600, cursor: 'pointer' }}><LogOut size={16} /> Logout</button>`
);

// Find the Add button
data = data.replace(
  /<button type="submit" style=\{\{ padding: '10px 24px', borderRadius: 8, background: 'var\(--accent\)', color: 'black', border: 'none', fontWeight: 600, cursor: 'pointer' \}\}>Add<\/button>/g,
  `<button type="submit" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 4, background: 'var(--accent)', color: 'black', border: 'none', fontWeight: 600, cursor: 'pointer' }}><Plus size={16} /> Add</button>`
);

// Form styling
data = data.replace(/borderRadius: 8/g, `borderRadius: 4`);

// Replace X buttons
data = data.replace(
  /<button type="submit" style=\{\{ background: 'none', border: 'none', color: 'var\(--down\)', cursor: 'pointer', fontSize: 18 \}\}>✕<\/button>/g,
  `<button type="submit" style={{ background: 'none', border: 'none', color: 'var(--down)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={16} /></button>`
);

fs.writeFileSync(file, data);
