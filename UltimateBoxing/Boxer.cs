using System.ComponentModel.DataAnnotations;

class Boxer
{
    public Boxer()
    {

    }

    [Required]
    public string Name { get; set; }
    public float Health { get; set; }
    public float Stamina { get; set; }
    public float Speed { get; set; }
    public float Strength { get; set; }

    public bool ThrowPunch()
    {
        return Health <= 0;
    }

    

}