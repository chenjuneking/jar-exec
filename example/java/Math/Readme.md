## Compile & Run class

```bash
$ javac App/Lib.java && javac App/Main.java && java -cp . App.Main add 10 21
```

## Create a JAR file

```bash
$ javac App/Lib.java && javac App/Main.java && jar cfme Math.jar Manifest.txt App.Main App/Main.class App/Lib.class
```

## Run a JAR file

```bash
$ java -jar Math.jar add 10 21
```
