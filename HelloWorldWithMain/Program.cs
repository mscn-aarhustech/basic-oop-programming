namespace HelloWorldWithMain;

class Program
{

    static void Main()
    {
        // Original line
        Console.WriteLine("Hello World!");

        // for loop
        for (int i = 0; i < 5; i++)
        {
            Console.WriteLine("Hello World!");
        }

        // while loop
        int j = 0;

        while (j < 5)
        {
            Console.WriteLine("Hello World!");
            j++;
        }

        // do/while loop
        int k = 0;

        do
        {
            Console.WriteLine("Hello World!");
            k++;
        }
        while (k < 5);

        // foreach
        string[] cars = { "Volvo", "BMW", "Ford", "Mazda" };

        foreach (string car in cars)
        {
            Console.WriteLine(car);
        }

        // Two dimensional array
        int[,] numbers = { { 1, 2 }, { 3, 4 } };

        Console.WriteLine(numbers[0, 0]);
    }
}
