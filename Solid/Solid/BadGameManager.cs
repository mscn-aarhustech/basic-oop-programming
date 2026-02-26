public class GameManager
{
    public void UpdatePlayer()
    {
        player.Move(InputManager.GetKeys());
        CollisionHandler.Update();
        
        if(Overlaps(player.hitbox, enemy.hitbox))
        {
            PhysicsEngine.SeparateEntities(player, enemy)
            HealthManager.DealDamage(player, enemy.damageValue);
            SoundManager.Playsound(player.damageSound);
            GfxRenderer.DrawSprite(player.position, "./splatter/blood-decal.jpg");

            if(player.health <= 0)
            {
                OnlineScoreBoardManager.ExecuteSql($$"""
                    UPDATE PLayer 
                    SET NumLosses = NumLosses + 1 
                    WHERE ID = {{player.id}}
                """);
                GameStateManager.EndGame();
            }
        }
    }
}

public class Rectangle
{
    public double Width { get; set; }
    public double Height { get; set; }
}

public class AreaCalculator
{
    public double CalculateArea(object[] shapes)
    {
        double area = 0;
        foreach (var shape in shapes)
        {
            if (shape is Rectangle rect)
            {
                area += rect.Width * rect.Height;
            }
            // Adding a Circle requires modifying this class
        }
        return area;
    }
}

public interface IShape
{
    double CalculateArea();
}

public class Rectangle : IShape
{
    public double Width { get; set; }
    public double Height { get; set; }

    public double CalculateArea() => Width * Height;
}

public class Circle : IShape
{
    public double Radius { get; set; }

    public double CalculateArea() => Math.PI * Radius * Radius;
}

public class AreaCalculator
{
    public double CalculateArea(IShape[] shapes)
    {
        double area = 0;
        foreach (var shape in shapes)
        {
            area += shape.CalculateArea();
        }
        return area;
    }
}

public class Bird
{
    public virtual void Fly()
    {
        Console.WriteLine("Flying high");
    }
}

public class Penguin : Bird
{
    // Penguin class inherits Bird class but can't replace Bird class
    // This violates the Liskov Substitution Principle
    public override void Fly()
    {
        throw new NotImplementedException("Penguins cannot fly.");
    }
}

public interface IBird
{
    void CleanFeathers();
}

public interface IFlying
{
    void Fly();
}

public interface ISwimming
{
    void Swim();
}

// All classes who inherit the IBird interface can replace each other.
public class Sparrow : IBird, IFlying
{
    public void CleanFeathers() { /* ... */ }
    public void Fly() { /* ... */ }
}

public class Penguin : IBird, ISwimming
{
    public void CleanFeathers() { /* ... */ }
    public void Swim() { /* ... */ }
}

public class Duck : IBird, IFlying, ISwimming
{
    public void CleanFeathers() { /* ... */ }
    public void Fly() { /* ... */ }
    public void Swim() { /* ... */ }
}

public interface IWorker
{
    void Work();
    void Sleep();
}

public class HumanWorker : IWorker
{
    public void Work() { Console.WriteLine("Working"); }
    public void Sleep() { Console.WriteLine("Sleeping"); }
}

public class RobotWorker : IWorker
{
    public void Work() { Console.WriteLine("Working"); }
    public void Sleep() 
    { 
        throw new NotImplementedException("Robots do not sleep."); 
    }
}

public interface IWorkable
{
    void Work();
}

public interface ISleepable
{
    void Sleep();
}

public class HumanWorker : IWorkable, ISleepable
{
    public void Work() { Console.WriteLine("Working"); }
    public void Sleep() { Console.WriteLine("Sleeping"); }
}

public class RobotWorker : IWorkable
{
    public void Work() { Console.WriteLine("Working"); }
}

public class SqlDatabase
{
    public void SaveData(string data) { /* save to SQL Server */ }
}

public class DataExporter
{
    private SqlDatabase _database;

    public DataExporter()
    {
        _database = new SqlDatabase(); // Tight coupling!!!
    }

    public void Export(string data)
    {
        _database.SaveData(data);
    }
}

public interface IDatabase
{
    void SaveData(string data);
}

public class SqlDatabase : IDatabase
{
    public void SaveData(string data) { /* save to SQL Server */ }
}

public class MongoDatabase : IDatabase
{
    public void SaveData(string data) { /* save to MongoDB */ }
}

public class DataExporter
{
    private readonly IDatabase _database;

    // The dependency is injected, making the class flexible and testable
    public DataExporter(IDatabase database)
    {
        _database = database;
    }

    public void Export(string data)
    {
        _database.SaveData(data);
    }
}

public class Invoice
{
    public decimal Amount { get; set; }

    public decimal CalculateTax()
    {
        return Amount * 0.2m;
    }

    public void PrintInvoice()
    {
        Console.WriteLine($"Invoice Amount: {Amount}");
    }
}

public class Invoice
{
    public decimal Amount { get; set; }

    public decimal CalculateTax()
    {
        return Amount * 0.2m;
    }
}

public class InvoicePrinter
{
    public void Print(Invoice invoice)
    {
        Console.WriteLine($"Invoice Amount: {invoice.Amount}");
    }
}