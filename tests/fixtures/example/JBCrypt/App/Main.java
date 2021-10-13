package App;
import java.util.Arrays;
import App.BCrypt;

public class Main {
  public static void main(String[] args) {
    String method = args[0];
    String[] arguments = Arrays.copyOfRange(args, 1, args.length);
    switch (method) {
      case "hashpw":
        System.out.print(BCrypt.hashpw(arguments[0], BCrypt.gensalt(10)));
        break;
      case "checkpw":
        System.out.print(BCrypt.checkpw(arguments[0], arguments[1]));
        break;
      default:
        System.out.print("Invalid method");
        break;
    }
  }
}