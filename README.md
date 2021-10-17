# njar

> Running JAR files on node.js

This package helps with running JAR files or Java classes on Node.js.

### Example

For more details, see the [example](https://github.com/chenjuneking/njar/tree/main/example).

## Install

```bash
npm install njar --save # install locally
npm install njar -g # or install globally
```

## Usage

### Install a specify version of openJDK

```bash
njar install 16 # install openjdk16
njar use 16 # use openjdk16
```

### Running JAR files

```javascript
const path = require('path')
const { executeJar } = require('njar')

async function main() {
  const jarPath = path.join(__dirname, './java/Math/Math.jar')
  const result = await executeJar(jarPath, ['add', '21', '33'])
  console.log(result) // '54'
}

main()
```

### Running Java classes

```javascript
const path = require('path')
const { executeClassWithCP } = require('njar')

async function main() {
  const className = 'App.Main'
  const classPaths = path.join(__dirname, './java/Math')
  const result = await executeClassWithCP(className, classPaths, [
    'multiply',
    '21',
    '33',
  ])
  console.log(result) // '693'
}

main()
```

## All CLI commands

```bash
njar install [version]  # Install a JDK version
njar use [version]      # Set the JDK version
njar versions           # List all JDK versions available to njar
njar which              # Display the full path to an executable
njar --help             # Show help information
```
