angular.module('cutlist').service('Projects', ['$http', 'Project', function ($http, Project) {
    var Projects = function () {
    };

    Projects.prototype.createNew = function (obj, stocks, details, cutlist, callback) {
        var plan;
        var result;
        var newProject;
        window.async.waterfall([
            (cb) => {
                $http.post('/plans', {
                    stocks: stocks,
                    details: details
                }).then(({data: plan}) => {
                    cb(null, plan);
                }, cb);
            },
            (newPlan, cb) => {
                plan = newPlan;
                if (cutlist) {
                    $http.post('/results', stripIds(cloneDeep(cutlist)))
                        .then(({data: result}) => {
                            cb(null, result);
                        }, cb);
                } else {
                    cb(null, {_id: void 0});
                }
            },
            (newResult, cb) => {
                result = newResult;
                $http.post('/projects', {
                    name: obj.name,
                    planId: plan._id,
                    resultId: result._id
                }).then(({data: project}) => cb(null, project), cb);
            }
        ], (err, project) => {
            newProject = new Project(project, plan, result);
            callback(err, newProject);
        });
    };

    Projects.prototype.loadAll = function (callback) {
        $http.get('/projects')
            .then(({data: projects}) => {
                window.async.map(projects, (project, cb) => {
                    this.load(project, cb);
                }, (err, projects) => {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, projects);
                });
            }, callback);
    };

    Projects.prototype.load = function (obj, callback) {
        var plan, result;
        window.async.waterfall([
            cb => {
                $http.get('/plans/' + obj.planId)
                    .then(({data: newPlan}) => {
                        plan = newPlan;
                        cb();
                    }, cb);
            },
            cb => {
                if (obj.resultId) {
                    $http.get('/results/' + obj.resultId)
                        .then(({data: newResult}) => {
                            result = newResult;
                            cb();
                        }, cb);
                } else {
                    cb();
                }
            }
        ], err => {
            if (err) {
                return callback(err);
            }

            var project = new Project(obj, plan, result);
            callback(null, project);
        });
    };

    // Dupe
    function cloneDeep (obj) {
        return window._.cloneDeep(obj);
    }

    function stripIds (obj) {
        if (!obj) {
            return null;
        }

        if (obj._id) {
            delete obj._id;
        }

        Object.values(obj).forEach(prop => Object.prototype.hasOwnProperty.call(obj, prop) && stripIds(prop));

        return obj;
    }

    return new Projects();
}]);
