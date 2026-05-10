const fs = require('fs');
const file = 'app/(main)/wallet/[address]/page.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace('import { useEffect, useState, useCallback } from "react";', 'import { useEffect, useState, useCallback } from "react";\nimport { Star } from "lucide-react";');

fs.writeFileSync(file, data);
