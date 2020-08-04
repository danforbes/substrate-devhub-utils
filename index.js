// Dependencies
const fs = require('fs');
const path = require('path');

// Variables
const subcommands = [
  {
    "name": 'rename-node-template',
    "description": 'Rename a substrate-node-template project.',
    "usage": 'rename-node-template <name>',
  },
  {
    "name": 'copy-binaries',
    "description": 'Copy the client and Wasm binaries to a separate folder.',
    "usage": 'copy-binaries <destination>',
  },
  {
    "name": 'rename-node-template-pallet',
    "description": 'Rename the template pallet that ships with the substrate-node-template project.',
    "usage": 'rename-node-template-pallet <name>',
  }
]

const subCommandNames = {};
subcommands.forEach((subcommand) => {
  if (!isValidSubcommand(subcommand)) {
    return;
  }

  subCommandNames[subcommand.name] = subcommand;
});

// Logic
const projectDir = process.cwd();
const isSubstrateProject = checkSubstrateProject(projectDir);
if (isSubstrateProject.error) {
  console.error(`${projectDir} is not a Substrate project. Please run this command from the root directory of a Substrate project.`);
  console.error(`This directory is not considered a Substrate project because ${isSubstrateProject.error}.`);
  process.exit(-1);
}

const numArgs = process.argv.length;
if (3 > numArgs) {
  noSupportedSubcommand();
}

const subCommandName = process.argv[2];
const subcommand = subCommandNames[subCommandName];
if (!subcommand) {
  noSupportedSubcommand();
}

const subcommandDep = subcommand.dep || path.join(__dirname, subcommand.name);

if (!fs.existsSync(`${subcommandDep}.js`)) {
  console.error('Could not find dependency for subcommand.');
  process.exit(2);
}

try {
  require(subcommandDep);
} catch (err) {
  console.error("Error executing subcomand.");
  console.error(err.message);
  process.exit(3);
}

// Helpers
function checkSubstrateProject(projectRoot) {
  const expectedFiles = [
    path.join(projectRoot, 'Cargo.toml'),
    path.join(projectRoot, 'node', 'Cargo.toml'),
    path.join(projectRoot, 'node', 'src', 'chain_spec.rs'),
    path.join(projectRoot, 'node', 'src', 'command.rs'),
    path.join(projectRoot, 'node', 'src', 'service.rs'),
    path.join(projectRoot, 'runtime', 'Cargo.toml'),
    path.join(projectRoot, 'runtime', 'src', 'lib.rs'),
  ]

  for (let fileIdx = 0; fileIdx < expectedFiles.length; ++fileIdx) {
    if (!fs.existsSync(expectedFiles[fileIdx])) {
      return {"error": `${expectedFiles[fileIdx]} does not exist`};
    }
  }

  return {"valid": true};
}

function noSupportedSubcommand() {
  console.error('You must provide a supported subcommand. The supported subcommands are:');
  subcommands.forEach((subcommand) => {
    if (!isValidSubcommand(subcommand)) {
      return;
    }

    console.error(` > ${subcommand.name} - ${subcommand.description}`);
  });

  process.exit(1);
}

function isValidSubcommand(subcommand) {
  return subcommand.name && subcommand.description;
}
