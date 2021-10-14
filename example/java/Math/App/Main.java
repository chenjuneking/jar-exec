package App;
import java.util.Arrays;
import App.Lib;

public class Main {
  public static void main(String[] args) {
    String method = args[0];
    String[] properties = Arrays.copyOfRange(args, 1, args.length);
    int[] items = Lib.caseInt(properties);
    switch (method) {
      case "add":
        System.out.print(Lib.add(items));
        break;
      case "subtract":
        System.out.print(Lib.subtract(items));
        break;
      case "multiply":
        System.out.print(Lib.multiply(items));
        break;
      case "devide":
        System.out.print(Lib.devide(items));
        break;
      default:
        System.out.print("Invalid method");
        break;
    }
  }
}