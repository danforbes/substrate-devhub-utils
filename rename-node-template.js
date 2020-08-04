const fs = require('fs');
const path = require('path');

const cwd = process.cwd();

const numArgs = process.argv.length;
if (4 > numArgs) {
  console.error('You must provide the new name for the template node.');
  process.exit(3);
}

const newName = process.argv[3];
const underbarred = newName.replace(/-/g, '_');
const nameRegex = /^[a-z]+[a-z0-9\-]*[a-z0-9]+$/;
if (!newName.match(nameRegex)) {
  console.error(`You must provide a new name that matches ${nameRegex}.`);
  process.exit(4);
}

renameNodeCargo();
renameChainSpec();
renameCommand();
renameService();
renameRuntimeCargo();
renameRuntimeLib();

function renameNodeCargo() {
  const nodeCargoPath = path.join(cwd, 'node', 'Cargo.toml');
  const nodeCargo = fs.readFileSync(nodeCargoPath, 'utf-8');
  fs.writeFileSync(nodeCargoPath, nodeCargo.replace(`authors = ['Substrate DevHub <https://github.com/substrate-developer-hub>']`, `authors = ['']`)
                                           .replace(`description = 'Substrate node template'`, `description = ''`)
                                           .replace(`homepage = 'https://substrate.io'`, `homepage = ''`)
                                           .replace(/name = 'node-template'/g, `name = '${newName}'`)
                                           .replace(`repository = 'https://github.com/substrate-developer-hub/substrate-node-template/'`, `repository = ''`)
                                           .replace('[dependencies.node-template-runtime]', `[dependencies.${newName}-runtime]`));
}

function renameChainSpec() {
  const chainSpecPath = path.join(cwd, 'node', 'src', 'chain_spec.rs');
  const chainSpec = fs.readFileSync(chainSpecPath, 'utf-8');
  fs.writeFileSync(chainSpecPath, chainSpec.replace('use node_template_runtime::{', `use ${underbarred}_runtime::{`));
}

function renameCommand() {
  const commandPath = path.join(cwd, 'node', 'src', 'command.rs');
  const command = fs.readFileSync(commandPath, 'utf-8');
  fs.writeFileSync(commandPath, command.replace('"Substrate Node"', `"${newName}"`)
                                       .replace('node_template_runtime::VERSION', `${underbarred}_runtime::VERSION`));
}

function renameService() {
  const servicePath = path.join(cwd, 'node', 'src', 'service.rs');
  const service = fs.readFileSync(servicePath, 'utf-8');
  fs.writeFileSync(servicePath, service.replace(/node_template_runtime/g, `${underbarred}_runtime`));
}

function renameRuntimeCargo() {
  const runtimeCargoPath = path.join(cwd, 'runtime', 'Cargo.toml');
  const runtimeCargo = fs.readFileSync(runtimeCargoPath, 'utf-8');
  fs.writeFileSync(runtimeCargoPath, runtimeCargo.replace(`authors = ['Substrate DevHub <https://github.com/substrate-developer-hub>']`, `authors = ['']`)
                                                 .replace(`homepage = 'https://substrate.io'`, `homepage = ''`)
                                                 .replace(`name = 'node-template-runtime'`, `name = '${newName}-runtime'`)
                                                 .replace(`repository = 'https://github.com/substrate-developer-hub/substrate-node-template/'`, `repository = ''`));
}

function renameRuntimeLib() {
  const runtimeLibPath = path.join(cwd, 'runtime', 'src', 'lib.rs');
  const runtimeLib = fs.readFileSync(runtimeLibPath, 'utf-8')
  fs.writeFileSync(runtimeLibPath, runtimeLib.replace(/create_runtime_str!\("node-template"\)/g, `create_runtime_str!("${newName}")`));
}
