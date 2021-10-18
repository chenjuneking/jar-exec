## How to use?

In the project directory, you can run the demo as follow:

```bash
# install the dependencies
$ npm install

# install openjdk16
$ npx njar install 16

# use openjdk16
$ npx njar use 16

# running the app
$ node index.js

# running via CLI
$ npx njar exec ./java/Math/Math.jar add 11 22 # running a jar
$ npx njar exec -cp ./java/Math/Math.jar App.Main add 11 22 # running jar files with cp
$ npx njar exec -cp ./java/Math App.Main add 11 22 # running compiled classes with cp
```
