using Raylib_cs;

namespace MyRaylibGame;

class Program
{
    static void Main()
    {
        Raylib.InitWindow(800, 480, "Hello World");

        while (!Raylib.WindowShouldClose())
        {
            Raylib.BeginDrawing();
            Raylib.ClearBackground(Color.White);

            Raylib.DrawCircle(400, 240, 50, Color.Red);

            Raylib.DrawLine(100, 100, 200, 200, Color.Blue);

            Raylib.DrawText("Setup Successful!", 190, 200, 20, Color.LightGray);

            Raylib.EndDrawing();
        }

        Raylib.CloseWindow();
    }
}