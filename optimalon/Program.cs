using System;
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

        if (result == "") {
          int stockIndex,stockCount,iPart,iLayout,partCount,partIndex,tmp,iStock;
          double width,height,X,Y,W,H;
          bool rotated,stockActive;
          string Txt;
          Console.Write("Used {0} stocks\n", Calculator.UsedStockCount);
          Console.Write("Created {0} different layouts\n", Calculator.LayoutCount);
          // Iterate by each layout and output information about each layout,
          // such as number and length of used stocks and part indices cut from the stocks
          for (iLayout = 0; iLayout < Calculator.LayoutCount; iLayout++) {
            Calculator.GetLayoutInfo(iLayout, out stockIndex, out stockCount);
            // Output information about each stock, such as stock Length
            for (iStock = stockIndex; iStock < stockIndex + stockCount; iStock++) {
              Calculator.GetStockInfo(iStock, out width, out height, out stockActive);
              Console.Write("Stock={0}: Width={1}; Height={2}\n", iStock, width, height);
              // Output the information about parts cut from this stock
              // First we get quantity of parts cut from the stock
              partCount = Calculator.GetPartCountOnStock(iStock);
              // Iterate by parts and get indices of cut parts
              for (iPart = 0; iPart < partCount; iPart++) {
                // Get global part index of iPart cut from the current stock
                partIndex = Calculator.GetPartIndexOnStock(iStock, iPart);
                // Get sizes and location of the source part with index partIndex
                Calculator.GetResultPart(partIndex, out tmp, out W, out H, out X, out Y, out rotated);
                // W,H – widht and height of the part partIndex
                // X,Y – coordinates of the top left corner of the part on the stock iStock
                // If rotated is true then the part has been roated by 90°
                Console.Write("Part={0}; stock={1}; Width={2}; Height={3}; X={4}; Y={5}; R={6}\n", partIndex, iStock, W, H, X, Y, rotated);
              }
            }
          }
        } else {
          Console.Write("%S", result);
          return;
        }
      } catch (Exception e) {
        Console.WriteLine(e.ToString());
      }
    }
  }
}
