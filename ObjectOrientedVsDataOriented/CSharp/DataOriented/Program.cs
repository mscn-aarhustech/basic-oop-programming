using System;
using System.Numerics;
using Raylib_cs;

namespace GravitySimulation

{
    public class Planets
    {
        public int MaxObjects;
        public float[] PositionX;
        public float[] PositionY;
        public float[] VelocityX;
        public float[] VelocityY;
        public float[] ForceX;
        public float[] ForceY;
        public float[] Mass;
        public float[] Density;
        public float[] Radius;
        public byte[] Color; // Stored as R, G, B triplets

        public Planets(int maxObjects)
        {
            MaxObjects = maxObjects;
            PositionX = new float[maxObjects];
            PositionY = new float[maxObjects];
            VelocityX = new float[maxObjects];
            VelocityY = new float[maxObjects];
            ForceX = new float[maxObjects];
            ForceY = new float[maxObjects];
            Mass = new float[maxObjects];
            Density = new float[maxObjects];
            Radius = new float[maxObjects];
            Color = new byte[maxObjects * 3];
        }
    }

    public class World
    {
        private int _width;
        private int _height;
        private float _gravitationalConst = 10.0f;
        private float _timeStep = 0.01f;
        public Planets Planets;
        private Random _rng = new Random();

        public World(int width, int height, int numPlanets)
        {
            _width = width;
            _height = height;
            Planets = new Planets(numPlanets);

            for (int i = 0; i < numPlanets; i++)
            {
                Planets.PositionX[i] = (float)_rng.NextDouble() * _width;
                Planets.PositionY[i] = (float)_rng.NextDouble() * _height;
                Planets.Mass[i] = 10f + (float)_rng.NextDouble() * 90f;
                Planets.Density[i] = 2.0f;
                Planets.Radius[i] = (float)Math.Sqrt(Planets.Mass[i] / (Planets.Density[i] * Math.PI));

                Planets.Color[i * 3] = (byte)_rng.Next(64, 256);     // R
                Planets.Color[i * 3 + 1] = (byte)_rng.Next(64, 256); // G
                Planets.Color[i * 3 + 2] = (byte)_rng.Next(64, 256); // B
            }
        }

        public void Update()
        {
            CalculateGravity();
            Integrate();
        }

        private void CalculateGravity()
        {
            int n = Planets.MaxObjects;
            float G = _gravitationalConst;

            for (int i = 0; i < n - 1; i++)
            {
                float iPosX = Planets.PositionX[i];
                float iPosY = Planets.PositionY[i];
                float iMass = Planets.Mass[i];
                float iRadius = Planets.Radius[i];
                float iForceX = 0;
                float iForceY = 0;

                for (int j = i + 1; j < n; j++)
                {
                    float distanceX = Planets.PositionX[j] - iPosX;
                    float distanceY = Planets.PositionY[j] - iPosY;

                    float distanceSquared = distanceX * distanceX + distanceY * distanceY;
                    float sumRadii = iRadius + Planets.Radius[j];
                    float sumRadiiSquared = sumRadii * sumRadii;

                    if (distanceSquared < sumRadiiSquared) continue;

                    float distance = (float)Math.Sqrt(distanceSquared);
                    float unitX = distanceX / distance;
                    float unitY = distanceY / distance;

                    float gravityForce = (G * iMass * Planets.Mass[j]) / distanceSquared;
                    float fx = gravityForce * unitX;
                    float fy = gravityForce * unitY;

                    iForceX += fx;
                    iForceY += fy;

                    Planets.ForceX[j] -= fx;
                    Planets.ForceY[j] -= fy;
                }

                Planets.ForceX[i] += iForceX;
                Planets.ForceY[i] += iForceY;
            }
        }

        private void Integrate()
        {
            for (int i = 0; i < Planets.MaxObjects; i++)
            {
                Planets.VelocityX[i] += (Planets.ForceX[i] / Planets.Mass[i]) * _timeStep;
                Planets.VelocityY[i] += (Planets.ForceY[i] / Planets.Mass[i]) * _timeStep;

                Planets.PositionX[i] += Planets.VelocityX[i] * _timeStep;
                Planets.PositionY[i] += Planets.VelocityY[i] * _timeStep;

                Planets.ForceX[i] = 0.0f;
                Planets.ForceY[i] = 0.0f;
            }
        }

        public void Render()
        {
            for (int i = 0; i < Planets.MaxObjects; i++)
            {
                Color color = new Color(
                    Planets.Color[i * 3],
                    Planets.Color[i * 3 + 1],
                    Planets.Color[i * 3 + 2],
                    (byte)255
                );

                Raylib.DrawCircle(
                    (int)Planets.PositionX[i],
                    (int)Planets.PositionY[i],
                    Planets.Radius[i],
                    color
                );
            }
        }
    }

    class Program
    {
        static void Main()
        {
            const int screenWidth = 1280;
            const int screenHeight = 720;

            Raylib.InitWindow(screenWidth, screenHeight, "Gravity Simulation - Raylib-cs");
            Raylib.SetTargetFPS(60);

            World world = new World(screenWidth, screenHeight, 1000);

            while (!Raylib.WindowShouldClose())
            {
                // Update Logic
                world.Update();

                // Render
                Raylib.BeginDrawing();
                Raylib.ClearBackground(Color.Black);

                world.Render();

                Raylib.DrawFPS(10, 10);
                Raylib.EndDrawing();
            }

            Raylib.CloseWindow();
        }
    }
}
