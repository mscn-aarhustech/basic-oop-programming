using Raylib_cs;
using System.Numerics; // Required for Vector2 used in lines/triangles

namespace MyRaylibGame;

class Program
{
    static void Main()
    {
        // Set MSAA 4x (smooths jagged edges of geometry)
        //Raylib.SetConfigFlags(ConfigFlags.Msaa4xHint);

        // 1. Setup
        Raylib.InitWindow(800, 600, "Raylib Common Commands");
        Raylib.SetTargetFPS(60); // Lock to 60 FPS

        // Load Texture
        string shipTexturePath = "./assets/kenney_space-shooter-extension/PNG/Sprites X2/Ships/spaceShips_002.png";
        Texture2D myTexture = Raylib.LoadTexture(shipTexturePath);

        // Generate smaller versions of the texture for the GPU to use when scaling down
        //Raylib.GenTextureMipmaps(ref myTexture);

        // 2. Enable Bilinear Filtering (The magic line)
        // This blends pixels together when rotated or scaled, smoothing the look.
        //Raylib.SetTextureFilter(myTexture, TextureFilter.Bilinear);

        // // Use Trilinear filtering for the best quality when scaling down
        //Raylib.SetTextureFilter(myTexture, TextureFilter.Trilinear);

        float rotation = 0.0f;

        while (!Raylib.WindowShouldClose())
        {
            Raylib.BeginDrawing();
            
            // 2. Clear Screen (Always do this first)
            Raylib.ClearBackground(Color.RayWhite);

            // --- SECTION A: Basic Text ---
            Raylib.DrawText("Common Graphics Primitives", 20, 20, 20, Color.DarkGray);

            // --- SECTION B: Rectangles ---
            // DrawRectangle(x, y, width, height, color)
            Raylib.DrawRectangle(20, 60, 100, 100, Color.SkyBlue);
            
            // DrawRectangleLines(x, y, width, height, color) - Outline only
            Raylib.DrawRectangleLines(130, 60, 100, 100, Color.Blue);

            // --- SECTION C: Circles ---
            // DrawCircle(centerX, centerY, radius, color)
            Raylib.DrawCircle(300, 110, 50, Color.Red);
            
            // DrawCircleGradient(centerX, centerY, radius, colorInner, colorOuter)
            Raylib.DrawCircleGradient(420, 110, 50, Color.Yellow, Color.Red);

            // --- SECTION D: Lines ---
            // Simple 1px line
            Raylib.DrawLine(500, 60, 600, 160, Color.Black);
            
            // Thick line (requires Vector2 for start/end points)
            Vector2 start = new Vector2(620, 60);
            Vector2 end = new Vector2(720, 160);
            Raylib.DrawLineEx(start, end, 5.0f, Color.DarkGreen);

            // --- SECTION E: Triangles ---
            // Requires 3 Vector2 points (Counter-Clockwise order)
            Raylib.DrawTriangle(
                new Vector2(60, 300),  // Bottom Left
                new Vector2(110, 200), // Top
                new Vector2(160, 300), // Bottom Right
                Color.Violet
            );

            // --- SECTION F: Transparency (Alpha) ---
            // Create a color with Alpha (R, G, B, Alpha) - 0 is invisible, 255 is solid
            Color transparentRed = new Color(255, 0, 0, 100);
            Color transparentBlue = new Color(0, 0, 255, 100);

            // Overlapping shapes to show blending
            Raylib.DrawCircle(300, 300, 50, transparentRed);
            Raylib.DrawCircle(350, 300, 50, transparentBlue);

            // Render texture basic
            //Raylib.DrawTexture(myTexture, 10, 10, Color.White);

            // Render texture extended (with transform options)
            // DrawTextureEx(texture, position, rotation, scale, tint)
            //Raylib.DrawTextureEx(myTexture, new Vector2(100, 100), 45.0f, 2.0f, Color.White);

            // Render texture advanced
            // 1. Source: What part of the image to draw? (x, y, width, height)
            // Use the full texture width/height to draw the whole image.
            Rectangle sourceRec = new Rectangle(0, 0, myTexture.Width, myTexture.Height);

            // 2. Destination: Where on screen? (x, y, width, height)
            // This handles TRANSLATION (x,y) and SCALING (width,height).
            Rectangle destRec = new Rectangle(400, 300, myTexture.Width * 2.0f, myTexture.Height * 2.0f);

            // 3. Origin: Where is the "pivot" point relative to the destination?
            // (0,0) is top-left. To rotate around the center, use half the destination width/height.
            Vector2 origin = new Vector2(destRec.Width / 2, destRec.Height / 2);

            // 4. Rotation: Angle in degrees
            rotation += 0.1f;

            // 5. Render
            Raylib.DrawTexturePro(myTexture, sourceRec, destRec, origin, rotation, Color.White);


            Raylib.EndDrawing();
        }

        Raylib.UnloadTexture(myTexture);

        Raylib.CloseWindow();
    }
}