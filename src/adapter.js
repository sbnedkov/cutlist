export default function translate (W, L, solution, names) {
    return {
        arr: mapActivities(solution.activities)
    };

    function mapActivities (activities) {
        var res = [];

        activities.forEach((activity) => {
            console.log(activity);
            console.log(activity.locations);
            var c = 0;

            activity.constituentsx.forEach((consx, conidx) => {
                consx.forEach((n, idx) => {
                    if (n) {
                        let l = activity.locations[conidx][idx];
                        let m = activity.constituentsy[conidx][idx];
                        res = res.concat(constructPart(n, m, l, activity.patternIsRotated[conidx], names[idx]));
                        c = c + 1;
                    }
                });
            });
        });

        return res;
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
        return res.map(flip);
    }

    function flip (result) {
        return {
            ref: result.ref,
            x: result.y,
            y: result.x,
            item: {
                w: result.item.h,
                h: result.item.w
            },
            rotated: result.rotated
        };
    }
}
