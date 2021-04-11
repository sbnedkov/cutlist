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
            W: Number(W),
            L: Number(L)
        });
        result.wasteVsUsage.push({
            area: 0,
            usage: 0
        });

        let partMatch;
        i++;
        do {
            partMatch = solution[i].match(PART_REGEXP);
            if (partMatch) {
                partsResult.push({
                    ref: '???',
                    x: Number(partMatch[5]),
                    y: Number(partMatch[6]),
                    item: {
                        w: Number(partMatch[3]),
                        h: Number(partMatch[4])
                    }
                });
            }
            i++;
        } while (partMatch && i < solution.length);
    }

    return result;
};
