using System;
using System.Collections.Generic;
using System.Numerics; // Provides a high-performance Vector2
using Raylib_cs;

namespace GravitySimulation
{
    public class Planet
    {
        public Vector2 Position;
        public Vector2 Velocity;
        public Vector2 Force;
        public float Mass;
        public float Density;
        public float Radius;
        public Color Color;

        // Dummy properties to simulate cache misses/memory bloat
        // Total: 30 * 4 bytes = 120 bytes of additional overhead per object
        private float[] _dummyProperties = new float[30];

        public Planet(float x, float y, float mass)
        {
            Position = new Vector2(x, y);
            Velocity = new Vector2(0, 0);
            Force = new Vector2(0, 0);
            Mass = mass;
            Density = 2.0f;
            Radius = (float)Math.Sqrt(Mass / (Density * Math.PI));

            Random rng = new Random();
            Color = new Color(
                (byte)rng.Next(64, 256),
                (byte)rng.Next(64, 256),
                (byte)rng.Next(64, 256),
                (byte)255
            );

            for (int i = 0; i < _dummyProperties.Length; i++)
            {
                _dummyProperties[i] = (float)rng.NextDouble();
            }
        }
    }

    public class World
    {
        private int _width;
        private int _height;
        private float _gravitationalConst = 10.0f;
        private float _timeStep = 0.01f;
        public List<Planet> Planets;

        public World(int width, int height, int numPlanets)
        {
            _width = width;
            _height = height;
            Planets = new List<Planet>();

            Random rng = new Random();
            for (int i = 0; i < numPlanets; i++)
            {
                float x = (float)rng.NextDouble() * _width;
                float y = (float)rng.NextDouble() * _height;
                float mass = 10f + (float)rng.NextDouble() * 90f;
                Planets.Add(new Planet(x, y, mass));
            }
        }

        public void CalculateGravity()
        {
            for (int i = 0; i < Planets.Count - 1; i++)
            {
                Planet planetI = Planets[i];

                for (int j = i + 1; j < Planets.Count; j++)
                {
                    Planet planetJ = Planets[j];

                    Vector2 distanceVector = planetJ.Position - planetI.Position;
                    float distanceSquared = distanceVector.LengthSquared();

                    float sumRadii = planetI.Radius + planetJ.Radius;
                    if (distanceSquared < sumRadii * sumRadii) continue;

                    float distance = (float)Math.Sqrt(distanceSquared);
                    Vector2 unitVector = distanceVector / distance;

                    float gravityForceMagnitude = (_gravitationalConst * planetI.Mass * planetJ.Mass) / distanceSquared;
                    Vector2 forceVector = unitVector * gravityForceMagnitude;

                    planetI.Force += forceVector;
                    planetJ.Force -= forceVector;
                }
            }
        }

        public void Integrate()
        {
            foreach (var planet in Planets)
            {
                planet.Velocity += (planet.Force / planet.Mass) * _timeStep;
                planet.Position += planet.Velocity * _timeStep;
                planet.Force = Vector2.Zero;
            }
        }

        public void Render()
        {
            foreach (var planet in Planets)
            {
                Raylib.DrawCircleV(planet.Position, planet.Radius, planet.Color);
            }
        }
    }

    class Program
    {
        static void Main()
        {
            const int screenWidth = 1280;
            const int screenHeight = 720;

            Raylib.InitWindow(screenWidth, screenHeight, "OOP Gravity Simulation");
            Raylib.SetTargetFPS(60);

            World world = new World(screenWidth, screenHeight, 1000);

            while (!Raylib.WindowShouldClose())
            {
                // Logic
                world.CalculateGravity();
                world.Integrate();

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