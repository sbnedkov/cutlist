using System;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using CutGLib.CutEngine;

namespace optimalon
{
  class Stock
  {
    public int width;
    public int height;
    public int number;
  }

  class Part
  {
    public int w;
    public int h;
    public int q;
    public string name;
    public bool canRotate;
  }

  class CuttingPlan
  {
    public string cutType;
    public Stock[] stocks;
    public Part[] parts;
  }

  class Program
  {
    static void Main(string[] args)
    {
      var jsonString = File.ReadAllText(args[0]);
      CuttingPlan plan = JsonConvert.DeserializeObject<CuttingPlan>(jsonString);

      CutEngine Calculator = new CutEngine();

      foreach (Stock stock in plan.stocks) {
        Calculator.AddStock(stock.width, stock.height, stock.number);
      }

      foreach (Part part in plan.parts) {
        Calculator.AddPart(part.width, part.height, part.q, part.canRotate);
      }

      string result = Calculator.Execute();
      if (result != "") {
        Console.Write("%S", result);
        return;
      }
    }
  }
}
