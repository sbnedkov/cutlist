module.exports = function translate (solution, names/*, cutType*/) {
    return {
        arr: mapActivities(solution.activities),
        wasteVsUsage: solution.losses.map(({area, usage}) => {
            return {
                area: toPercent(area),
                usage: toPercent(usage)
            };
        })
    };

    function mapActivities (allActivities) {
        var allStocksRes = [];
        var res = [];

        allActivities.forEach(activities => {
            activities.forEach(activity => {
                activity.constituentsx.forEach((consx, conidx) => {
                    consx.forEach((n, idx) => {
                        if (n) {
                            let l = activity.locations[conidx][idx];
                            let m = activity.constituentsy[conidx][idx];
                            res = res.concat(constructPart(n, m, l, activity.patternIsRotated[conidx], names[idx]));
                        }
                    });
                });
            });

            allStocksRes.push({
                result: res,
                W: activities[0].W,
                L: activities[0].L
            });
            res = [];
        });

        return allStocksRes;
    }

    function constructPart (n, m, location, rotated, name) {
        var blockw = location.x2 - location.x1;
        var blockh = location.y2 - location.y1;
        var w = blockw / n;
        var h = blockh / m;

        var res = [];
        // Right now either n or m will be 1, find out which one
        if (m === 1) { // horizontal block
            for (let i = 0; i < n; i++) {
                res.push({
                    ref: name,
                    x: location.x1 + i * w,
                    y: location.y1,
                    item: {
                        w,
                        h
                    },
                    rotated
                });
            }
        } else if (n === 1) { // vertical block
            for (let i = 0; i < m; i++) {
                res.push({
                    ref: name,
                    x: location.x1,
                    y: location.y1 + i * h,
                    item: {
                        w,
                        h
                    },
                    rotated
                });
            }
        } else {
            for (let i = 0; i < m; i++) {
                let tmpLocation = {
                    x1: location.x1,
                    x2: location.x2,
                    y1: location.y1 + i * h,
                    y2: location.y2 + i * h - (m - 1) * h
                };
                res = res.concat(constructPart(n, 1, tmpLocation, rotated, name));
            }
        }
        return res;
    }

    function toPercent (figure) {
        return (figure * 100).toFixed(2) + '%';
    }
};
