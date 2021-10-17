const path = require('path')
const { executeJar, executeClassWithCP } = require('njar')

async function main() {
  const jarPath = path.join(__dirname, './java/Math/Math.jar')
  const result1 = await executeJar(jarPath, ['add', '21', '33'])
  console.log(result1) // '54'

  const className = 'App.Main'
  const classPaths = path.join(__dirname, './java/Math')
  const result2 = await executeClassWithCP(className, classPaths, [
    'multiply',
    '21',
    '33',
  ])
  console.log(result2) // '693'
}

main()
