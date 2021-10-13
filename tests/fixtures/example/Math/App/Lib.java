package App;

public class Lib {
  public static int add(int[] args) {
    int result = args[0];
    for (int i = 1; i < args.length; i++) {
      result += args[i];
    }
    return result;
  }

  public static int subtract(int[] args) {
    int result = args[0];
    for (int i = 1; i < args.length; i++) {
      result -= args[i];
    }
    return result;
  }

  public static int multiply(int[] args) {
    int result = args[0];
    for (int i = 1; i < args.length; i++) {
      result *= args[i];
    }
    return result;
  }

  public static int devide(int[] args) {
    int result = args[0];
    for (int i = 1; i < args.length; i++) {
      result /= args[i];
    }
    return result;
  }

  public static int[] caseInt(String[] args) {
    int[] results = new int[args.length];
    for (int i = 0; i < args.length; i++) {
      results[i] = Integer.parseInt(args[i]);
    }
    return results;
  }
}