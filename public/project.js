angular.module('cutlist').factory('Project', ['$http', function ($http) {
    var Project = function (project, plan, result) {
        this.obj = project;
        this.savedObj = cloneDeep(project);
        this.plan = plan;
        this.savedPlan = cloneDeep(plan);
        this.result = result;
        this.savedResult = result && cloneDeep(result);
    };

    Project.prototype.save = function (callback) {
        window.async.waterfall([
            cb => {
                var patch = createPatch(this.savedPlan, this.plan);
                $http.patch('/plans/' + this.plan._id, patch)
                    .then(({data: plan}) => {
                        this.plan = plan;
                        this.savedPlan = cloneDeep(plan);
                        cb();
                    }, cb);
            },
            cb => {
                if (this.savedResult) {
                    var patch = createPatch(this.savedResult, this.result);
                    $http.patch('/results/' + this.result._id, patch)
                        .then(({data: result}) => {
                            this.result = result;
                            this.savedResult = cloneDeep(result);
                            cb();
                        }, cb);
                } else {
                    if (this.result) {
                        $http.post('/results', this.result)
                            .then(({data: result}) => {
                                this.result = result;
                                this.savedResult = cloneDeep(result);

                                var patch = createPatch(this.savedObj, this);
                                $http.patch('/projects/' + this.obj._id, patch)
                                    .then(({data: project}) => {
                                        this.savedObj = cloneDeep(project);
                                        cb();
                                    }, cb);
                                cb();
                            }, cb);
                    } else {
                        cb();
                    }
                }
            }
        ], callback);
    };

    Project.prototype.delete = function (callback) {
        window.async.waterfall([
            cb => {
                $http.delete('/plans/' + this.plan._id)
                    .then(() => cb(), cb);
            },
            cb => {
                if (this.result) {
                    $http.delete('/results/' + this.result._id)
                        .then(() => cb(), cb);
                } else {
                    cb();
                }
            },
            cb => {
                $http.delete('/projects/' + this.obj._id)
                    .then(() => cb(), cb);
            }
        ], callback);
    };

    Project.prototype.resetChanges = function () {
        this.plan = this.savedPlan;
        this.result = this.savedResult;
    };

    Project.prototype.hasChanged = function () {
        var planChanged = hasChanged(this.savedPlan, this.plan);
        var resultChanged = hasChanged(this.savedResult, this.result);
        console.log('Plan changed: ', planChanged, 'result changed: ', resultChanged);

        return planChanged || resultChanged;
    };

    Project.prototype.setResult = function (result) {
        this.result = result;
    };

    function createPatch (savedObj, obj) {
        if (!savedObj || !obj) {
            return {};
        }

        obj._id = savedObj._id;
        obj.creation_date = savedObj.creation_date;
        return window.JSON8Patch.diff(savedObj, obj);
    }

    function hasChanged (savedObj, obj) {
        console.log(window.JSON8Patch.diff(savedObj, obj), window.JSON8Patch.diff(savedObj, obj).length);
        var diff = savedObj && window.JSON8Patch.diff(savedObj, obj);
        if (!diff || !diff.length) {
            return false;
        }

        return diff.length !== 1 || diff[0].path === ''; // XXX: investigate why this patches appear: op:"add", path:"", value:null
    }

    function cloneDeep (obj) {
        return window._.cloneDeep(obj);
    }

    return Project;
}]);
