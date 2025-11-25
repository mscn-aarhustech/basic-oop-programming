using System;
using System.Collections.Generic;
using System.Numerics;
using System.Text;

using Raylib_cs;

namespace RayLibAsteroids
{
    abstract class GameObject
    {
        internal Vector2 Position;
        internal Vector2 Velocity;
        internal Vector2 Force;
        internal float Mass;

        internal Texture2D Texture;

        internal void Update(float dt)
        {
            Velocity += Force / Mass * dt; 
            Position += Velocity * dt;
            Force.X = 0.0f;
            Force.Y = 0.0f;
        }
    }
}
