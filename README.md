# jar-exe

> Running JAR files on node.js

This package helps with running JAR files or Java classes on Node.js.

## Install

```bash
npm install jar-exec --save
```

## Usage

### Install a specify version of openJDK

```bash
cd to/your/project
npx jar-exec install 16 # install openjdk16
```

### Running JAR files

```javascript
const path = require('path')
const { executeJar } = require('jar-exec')

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
const { executeClassWithCP } = require('jar-exec')

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
