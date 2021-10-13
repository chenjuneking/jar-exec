## Compile & Run class

```bash
$ javac App/BCrypt.java && javac App/Main.java && java -cp . App.Main hashpw foobar
```

## Create a JAR file

```bash
$ javac App/BCrypt.java && javac App/Main.java && jar cfme JBCrypt.jar Manifest.txt App.Main App/Main.class App/BCrypt.class
```

## Run a JAR file

```bash
$ java -jar JBCrypt.jar hashpw foobar
$ java -jar JBCrypt.jar checkpw foobar 123456
```
