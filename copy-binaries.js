const fs = require('fs');
const path = require('path');

const lastCommit = require('git-last-commit');
const mkdir = require('mkdirp');

const cwd = process.cwd();

const numArgs = process.argv.length;
if (4 > numArgs) {
  console.error('You must provide the path where the binaries should be copied.');
  process.exit(5);
}

const nodeName = fs.readFileSync(path.join(cwd, 'node', 'Cargo.toml'), 'utf-8').match(/\[\[bin\]\]\nname = '(.+)'/);
if (!nodeName) {
  console.error('Cannot find node name in Cargo file.');
  process.exit(6);
}

const runtimeName = fs.readFileSync(path.join(cwd, 'runtime', 'Cargo.toml'), 'utf-8').match(/name = '(.+)'/);
if (!runtimeName) {
  console.error('Cannot find runtime name in Cargo file.');
  process.exit(7);
}

mkdir.sync(path.join(cwd, process.argv[3]));
lastCommit.getLastCommit((err, info) => {
    if (err) {
        console.error('Cannot get last git commit.');
        process.exit(8);
    }

    fs.copyFileSync(path.join(cwd, 'target', 'release', nodeName[1]), path.join(cwd, process.argv[3], `${nodeName[1]}-${info.shortHash}`));

    const underbarredRuntime = runtimeName[1].replace(/-/g, '_');
    fs.copyFileSync(path.join(cwd, 'target', 'release', 'wbuild', runtimeName[1], `${underbarredRuntime}.compact.wasm`), path.join(cwd, process.argv[3], `${underbarredRuntime}_${info.shortHash}.compact.wasm`));
}, {dst: cwd});
