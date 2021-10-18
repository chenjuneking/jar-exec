const path = require('path')
const { execute, executeWithCP } = require('njar')

async function main() {
  const jarPath = path.join(__dirname, './java/Math/Math.jar')
  const result1 = await execute(jarPath, ['add', '21', '33'])
  console.log(result1) // '54'

  const className = 'App.Main'
  const classPaths = path.join(__dirname, './java/Math')
  const result2 = await executeWithCP(classPaths, className, [
    'multiply',
    '21',
    '33',
  ])
  console.log(result2) // '693'
}

main()
