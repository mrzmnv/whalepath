const fs = require('fs');
const file = 'app/(main)/wallet/[address]/page.tsx';
let data = fs.readFileSync(file, 'utf8');

if (!data.includes('import { Star } from "lucide-react"')) {
  data = data.replace('import { useState, useEffect, useCallback } from "react";', 'import { useState, useEffect, useCallback } from "react";\nimport { Star } from "lucide-react";');
}

fs.writeFileSync(file, data);
