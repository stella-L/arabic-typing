const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

function copy(src, dest) {
  fs.cpSync(src, dest, { recursive: true });
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.rmSync(dist, { recursive: true, force: true });
ensureDir(dist);

const dataFiles = new Set(['words.json', 'sentences.json']);

for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (entry.isFile() && (/\.(html|js|css)$/.test(entry.name) || dataFiles.has(entry.name))) {
    copy(path.join(root, entry.name), path.join(dist, entry.name));
  }
}

copy(path.join(root, 'img'), path.join(dist, 'img'));
copy(path.join(root, '.openai'), path.join(dist, '.openai'));
const distHostingPath = path.join(dist, '.openai', 'hosting.json');
fs.writeFileSync(distHostingPath, '{}\n');

ensureDir(path.join(dist, 'server'));
fs.writeFileSync(path.join(dist, 'server', 'index.js'), `
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/') {
      return env.ASSETS.fetch(new Request(new URL('/index.html', url), request));
    }
    return env.ASSETS.fetch(request);
  }
};
`.trimStart());
