using System;
using System.IO;
using Microsoft.Win32.SafeHandles;
using System.Runtime.InteropServices;

class Program
{
    // --- Win32 API Imports ---
    [DllImport("Kernel32.dll", SetLastError = true, CharSet = CharSet.Auto)]
    static extern SafeFileHandle CreateFile(
        string fileName,
        [MarshalAs(UnmanagedType.U4)] uint fileAccess,
        [MarshalAs(UnmanagedType.U4)] uint fileShare,
        IntPtr securityAttributes,
        [MarshalAs(UnmanagedType.U4)] FileMode creationDisposition,
        [MarshalAs(UnmanagedType.U4)] int flags,
        IntPtr template);

    [DllImport("kernel32.dll", SetLastError = true)]
    static extern bool WriteConsoleOutput(
        SafeFileHandle hConsoleOutput,
        CHAR_INFO[] lpBuffer,
        COORD dwBufferSize,
        COORD dwBufferCoord,
        ref SMALL_RECT lpWriteRegion);

    [StructLayout(LayoutKind.Sequential)]
    public struct COORD
    {
        public short X;
        public short Y;
        public COORD(short x, short y) { X = x; Y = y; }
    }

    [StructLayout(LayoutKind.Explicit)]
    public struct CHAR_INFO
    {
        [FieldOffset(0)] public char UnicodeChar;
        [FieldOffset(0)] public byte AsciiChar;
        [FieldOffset(2)] public short Attributes;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct SMALL_RECT
    {
        public short Left;
        public short Top;
        public short Right;
        public short Bottom;
    }

    // --- Configuration ---
    static int Width = 120;
    static int Height = 40;

    static void Main(string[] args)
    {
        SetupConsole();

        // 1. Get Handle to Console Output
        SafeFileHandle hConsole = CreateFile("CONOUT$", 0x40000000, 2, IntPtr.Zero, FileMode.Open, 0, IntPtr.Zero);

        if (hConsole.IsInvalid)
        {
            Console.WriteLine("Error accessing console handle.");
            return;
        }

        // 2. Initialize Buffers
        CHAR_INFO[] buf = new CHAR_INFO[Width * Height];
        SMALL_RECT rect = new SMALL_RECT { Left = 0, Top = 0, Right = (short)Width, Bottom = (short)Height };

        // Game State
        float ballX = Width / 2;
        float ballY = Height / 2;
        float velX = 1.5f;
        float velY = 0.8f;
        float time = 0;

        // 3. Main Loop
        while (true)
        {
            // --- Update Logic ---
            ballX += velX;
            ballY += velY;

            // Collision detection
            if (ballX <= 0 || ballX >= Width - 1) velX *= -1;
            if (ballY <= 0 || ballY >= Height - 1) velY *= -1;

            time += 0.05f;

            // --- Render to Buffer ---
            for (int i = 0; i < buf.Length; i++)
            {
                int x = i % Width;
                int y = i / Width;

                // Create a moving background pattern
                byte color = (byte)((x + y + (int)(time * 5)) % 15 + 1);

                // Draw Background (Low opacity character)
                buf[i].UnicodeChar = '░';
                buf[i].Attributes = (short)(color); // Foreground color only

                // Draw Ball
                if ((int)ballX == x && (int)ballY == y)
                {
                    buf[i].UnicodeChar = 'O';
                    buf[i].Attributes = 0x0E; // Yellow on Black (0x0F is White)
                }
            }

            // --- Blit to Screen ---
            // This is the critical step that prevents flicker.
            // We write the entire array to the console buffer in one OS call.
            bool b = WriteConsoleOutput(hConsole, buf,
                new COORD((short)Width, (short)Height),
                new COORD(0, 0),
                ref rect);
        }
    }

    static void SetupConsole()
    {
        Console.CursorVisible = false;
        // Depending on terminal settings, setting window size via code might be restricted.
        // It is often safer to set the buffer size to match.
        if (OperatingSystem.IsWindows())
        {
            try
            {
                Console.SetWindowSize(Width, Height);
                Console.SetBufferSize(Width, Height);
            }
            catch
            {
                // Fallback if resizing is locked by Windows Terminal
                Width = Console.WindowWidth;
                Height = Console.WindowHeight;
            }
        }
    }
}