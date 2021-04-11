// const STOCKN_REGEXP = /Used (.*) stocks/;
const STOCK_REGEXP = /Stock=(.*): Width=(.*); Height=(.*)/;
const PART_REGEXP = /Part=(.*); stock=(.*); Width=(.*); Height=(.*); X=(.*); Y=(.*); R=(.*)/;

module.exports = function translate (solution) {
    // const stockN = Number(solution.shift().match(STOCKN_REGEXP)[1]);
    // Skip two lines
    solution.shift();
    solution.shift();

    const result = {
      arr: [],
      wasteVsUsage: []
    };

    let i = 0;
    while (i < solution.length) {
      const match = Number(solution[i].match(STOCK_REGEXP));
      // const stockN = match[1];
      const W = match[2];
      const L = match[3];
      
      const partsResult = [];
      result.arr.push({
          result: partsResult,
          W: W,
          L: L
      });
      result.wasteVsUsage.push({
          area: 0,
          usage: 0
      });

      let partMatch = solution[++i].match(PART_REGEXP);
      do {
        partMatch.push({
          ref: '???',
          x: partMatch[5],
          y: partMatch[6],
          item: {
            w: partMatch[3],
            h: partMatch[4]
          }
        });
        partMatch = solution[++i].match(PART_REGEXP);
      } while (partMatch && i < solution.length);
    }

    return result;
};
