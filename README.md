# njar

> Running JAR files on node.js

This package helps with running JAR files or Java classes on Node.js.

### Preview

![preview](https://raw.githubusercontent.com/chenjuneking/njar/main/preview.gif)

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

### Running JAR files on CLI

```bash
# running jar files
njar exec ./Math.jar add 11 22

# running jar files with cp
njar exec -cp ./Math.jar App.Main add 11 22
# running compiled classes with cp
njar exec -cp . App.Main add 11 22
```

### Running JAR files programmatically

```javascript
const path = require('path')
const { execute } = require('njar')

async function main() {
  const jarPath = path.join(__dirname, './Math.jar')
  const result = await execute(jarPath, ['add', '2', '4'])
  console.log(result) // '6'
}

main()
```

### Running with cp

```javascript
const path = require('path')
const { executeWithCP } = require('njar')

async function main() {
  const className = 'App.Main'
  const classPaths = path.join(__dirname, '.')
  const result = await executeWithCP(classPaths, className, [
    'multiply',
    '2',
    '3',
  ])
  console.log(result) // '6'
}

main()
```

## All CLI commands

```bash
njar install [version]  # Install a JDK version
njar use [version]      # Set the JDK version
njar versions           # List all JDK versions available to njar
njar which              # Display the full path to an executable
njar exec               # Running java application
njar --help             # Show help information
```
