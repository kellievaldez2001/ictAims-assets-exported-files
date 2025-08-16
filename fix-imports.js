// fix-imports.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const SRC_DIR = path.join(__dirname, 'src');

// Helper to get relative path from file to import target
function getRelativeImport(fromFile, toFile) {
  let rel = path.relative(path.dirname(fromFile), toFile);
  if (!rel.startsWith('.')) rel = './' + rel;
  // Remove .js/.jsx/.ts/.tsx extension for JS imports
  rel = rel.replace(/\.(js|jsx|ts|tsx)$/, '');
  return rel.replace(/\\/g, '/');
}

// Find all JS/TS files in src
const files = glob.sync(`${SRC_DIR}/**/*.{js,jsx,ts,tsx}`);

// Build a map of all files by basename (for quick lookup)
const fileMap = {};
files.forEach(f => {
  fileMap[path.basename(f)] = f;
});

// Regex to match import statements
const importRegex = /import\s+.*?from\s+['"](.+?)['"]/g;
const requireRegex = /require\(['"](.+?)['"]\)/g;

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Update import statements
  code = code.replace(importRegex, (match, importPath) => {
    // Only fix relative imports (not packages)
    if (!importPath.startsWith('.')) return match;

    // Try to resolve the import target
    let importFile = path.resolve(path.dirname(file), importPath);
    let found = null;
    // Try with .js, .jsx, .ts, .tsx, /index.js, etc.
    const exts = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx', '/index.ts', '/index.tsx'];
    for (let ext of exts) {
      if (fs.existsSync(importFile + ext)) {
        found = importFile + ext;
        break;
      }
    }
    if (!found) return match; // Can't resolve, skip

    // Compute new relative path
    const newRel = getRelativeImport(file, found);
    if (newRel !== importPath) {
      changed = true;
      return match.replace(importPath, newRel);
    }
    return match;
  });

  // Update require statements
  code = code.replace(requireRegex, (match, importPath) => {
    if (!importPath.startsWith('.')) return match;
    let importFile = path.resolve(path.dirname(file), importPath);
    let found = null;
    const exts = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx', '/index.ts', '/index.tsx'];
    for (let ext of exts) {
      if (fs.existsSync(importFile + ext)) {
        found = importFile + ext;
        break;
      }
    }
    if (!found) return match;
    const newRel = getRelativeImport(file, found);
    if (newRel !== importPath) {
      changed = true;
      return match.replace(importPath, newRel);
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(file, code, 'utf8');
    console.log(`Updated imports in: ${file}`);
  }
});

console.log('✅ Import paths updated!');
