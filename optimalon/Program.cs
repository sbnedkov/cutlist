﻿using System;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using CutGLib;

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
      try {
        var jsonString = File.ReadAllText(args[0]);
        CuttingPlan plan = JsonConvert.DeserializeObject<CuttingPlan>(jsonString);

        CutEngine Calculator = new CutEngine();

        foreach (Stock stock in plan.stocks) {
          Calculator.AddStock(stock.width, stock.height, stock.number);
        }

        foreach (Part part in plan.parts) {
          Calculator.AddPart(part.w, part.h, part.q, part.canRotate);
        }

        string result = Calculator.Execute();
        if (result != "") {
          Console.Write("%S", result);
          return;
        }
      } catch (Exception e) {
        Console.WriteLine(e.ToString());
      }
    }
  }
}
