const fs = require('fs');
const path = require('path');

const cwd = process.cwd();

const numArgs = process.argv.length;
if (4 > numArgs) {
  console.error('You must provide the new name for the template pallet.');
  process.exit(3);
}

const newName = process.argv[3];
const nameRegex = /^pallet-[a-z]+[a-z0-9\-]*[a-z0-9]+$/;
if (!newName.match(nameRegex)) {
  console.error(`You must provide a new name that matches ${nameRegex}.`);
  process.exit(4);
}

const short = newName.substring('pallet-'.length);
const underbarred = newName.replace(/-/g, '_');
const camel = short[0].toUpperCase() + short.slice(1)
             .replace(/([-][a-z])/g, (firstLetter) => firstLetter.toUpperCase().replace('-', ''));

const newPath = path.join(cwd, 'pallets', short);
const newSrcPath = path.join(newPath, 'src');

movePalletDir();
renamePalletCargo();
renamePalletModule(path.join(newSrcPath, 'lib.rs'));
renamePalletModule(path.join(newSrcPath, 'mock.rs'));
renamePalletModule(path.join(newSrcPath, 'tests.rs'));
renameRuntimeCargo();
renameRuntimeLib();
renameRootCargo();

function movePalletDir() {
  fs.renameSync(newPath.replace(short, 'template'), newPath);
}

function renamePalletCargo() {
  const palletCargoPath = path.join(newPath, 'Cargo.toml');
  const nodeCargo = fs.readFileSync(palletCargoPath, 'utf-8');
  fs.writeFileSync(palletCargoPath, nodeCargo.replace(`authors = ['Substrate DevHub <https://github.com/substrate-developer-hub>']`, `authors = ['']`)
                                           .replace(`description = 'FRAME pallet template for defining custom runtime logic.'`, `description = ''`)
                                           .replace(`homepage = 'https://substrate.dev'`, `homepage = ''`)
                                           .replace(/name = 'pallet-template'/g, `name = '${newName}'`)
                                           .replace(`repository = 'https://github.com/substrate-developer-hub/substrate-node-template/'`, `repository = ''`));
}

function renamePalletModule(filePath) {
  const file = fs.readFileSync(filePath, 'utf-8');
  fs.writeFileSync(filePath, file.replace(/TemplateModule/g, camel));
}

function renameRuntimeCargo() {
  const runtimeCargoPath = path.join(cwd, 'runtime', 'Cargo.toml');
  const runtimeCargo = fs.readFileSync(runtimeCargoPath, 'utf-8');
  fs.writeFileSync(runtimeCargoPath, runtimeCargo.replace(/pallet-template/g, newName)
                                                 .replace(`'../pallets/template'`, `'../pallets/${short}'`));
}

function renameRuntimeLib() {
  const runtimeLibPath = path.join(cwd, 'runtime', 'src', 'lib.rs');
  const runtimeLib = fs.readFileSync(runtimeLibPath, 'utf-8');
  fs.writeFileSync(runtimeLibPath, runtimeLib.replace(`TemplateModule`, camel)
                                             .replace(`/// Import the template pallet.`, `/// Import the ${camel} pallet.`)
                                             .replace('/// Configure the template pallet in pallets/template.',
                                                      `/// Configure the ${camel} pallet in pallets/${short}.`)
                                             .replace('// Include the custom logic from the template pallet in the runtime.',
                                                      `// Include the custom logic from the ${camel} pallet in the runtime.`)
                                             .replace(/pallet_template/g, underbarred)
                                             .replace(/template/g, short));
}

function renameRootCargo() {
  const rootCargoPath = path.join(cwd, 'Cargo.toml');
  const rootCargo = fs.readFileSync(rootCargoPath, 'utf-8');
  fs.writeFileSync(rootCargoPath, rootCargo.replace(`'pallets/template'`, `'pallets/${short}'`));
}
