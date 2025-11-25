using System;
using System.Collections.Generic;
using System.Numerics;
using System.Text;

using Raylib_cs;


namespace RayLibAsteroids
{
    internal class Ship : GameObject
    {
        internal Ship(Vector2 position, float mass, Texture2D texture)
        {
            Console.WriteLine("Ship ctor called!");

            Position = position;
            Mass = mass;
            Texture = texture;
        }

        internal float Angle;
    }
}
