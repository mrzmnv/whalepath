const fs = require('fs');
const file = 'components/StatsBar.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace('      })}' + '\n' + '    </div>' + '\n' + '      ))}' + '\n' + '    </div>' + '\n' + '  );' + '\n' + '}', '      })}\n    </div>\n  );\n}');

fs.writeFileSync(file, data);
