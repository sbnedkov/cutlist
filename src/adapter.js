export default function translate (solution) {
    return {
        arr: mapActivities(solution.activities)
    };

    function mapActivities (activities) {
        var res = [];

        activities.forEach(activity => {
            console.log(activity);
            var c = 0;

            activity.constituentsx.forEach((consx, conidx) => {
                consx.forEach((n, idx) => {
                    if (n) {
                        let m = activity.constituentsy[conidx][idx];
                        for (let i = 0; i < n * m; i++) {
                            res.push(constructPart(i, n, m, activity.locations[c], activity.patternIsRotated[c]));
                        }
                    }

                    c = c + 1;
                });
            });
        });

        return res;
    }

    function constructPart (idx, n, m, location, rotated) {
        var blockw = location.x2 - location.x1;
        var blockh = location.y2 - location.y1;
        var w = blockw / n;
        var h = blockh / m;

        // Right now either n or m will be 1, find out which one
        if (m === 1) { // horizontal block
            return {
                x: location.x1 + idx * w,
                y: location.y1,
                item: {
                    ref: '???',
                    w,
                    h
                },
                rotated
            };
        } else if (n === 1) { // vertical block
            return {
                x: location.x1,
                y: location.y1 + idx * h,
                item: {
                    ref: '???',
                    w,
                    h
                },
                rotated
            };
        } else {
            throw new Error(`Cutting pattern has more dimensions: ${n}x${m}`);
        }
    }
}
