var fs = require('fs');

var logger = require('winston');
var guillotineSolver = require('guillotine-solver');
var solve = guillotineSolver.default;

var translate = require('./adapter');
var utils = require('./utils');

var User = require('./db/user');
var Plan = require('./db/plan');
var Result = require('./db/result');
var Project = require('./db/project');

const ROBOTS_TXT = fs.readFileSync(__dirname + '/../robots.txt');

var cutlists = {};

function AccessDeniedError () {
    this.message = 'Access denied.';
    Error.call(this);
}
AccessDeniedError.prototype = Object.create(Error.prototype);
AccessDeniedError.prototype.constructor = AccessDeniedError;

module.exports = {
    root: async (req, res) => {
        res.render('index.jade', {
            userId: req.session.user,
            username: req.session.username
        });
    },
    lang: async (req, res) => {
//        res.cookie('cutlistlang', req.body.lang);
        res.status(200).end();
    },
    cutlist: async (req, res) => {
        var stocks = req.body.stocks;
        var parts = req.body.parts;
        var type = req.body.cutType;
        var itemsw = [];
        var itemsh = [];
        var demands = [];
        var names = [];
        var canRotate = [];

        if (type === 'o') {
            throw new Error('Optimal cut type not implemented yet');
        }

        parts.forEach(item => {
            if (item.ref && item.q) {
                itemsw.push(item.w);
                itemsh.push(item.h);
                demands.push(item.q);
                names.push(item.ref);
                canRotate.push(item.canRotate);
            }
        });

        var key = (Math.random() * 1e18).toString(36);

        res.send(key).end();

        var interrimResult= {
            activities: [],
            losses: []
        };

        trySolve();

        function trySolve () {
            try {
                const solution = solve(stocks, itemsw, itemsh, canRotate, demands, type);
                cutlists[key] = translate(merge(interrimResult, solution), names);
            } catch (err) {
                cutlists[key] = {err: err.message};
            }
        }

        function merge (dst, src) {
            return {
                activities: dst.activities.concat(src.activities),
                losses: dst.losses.concat(src.losses)
            };
        }
    },
    checkFinished: async (req, res) => {
        var result = cutlists[req.params.key];
        if (result) {
            delete cutlists[req.params.key];
            return res.json(result);
        }

        res.json(false);
    },
    login: async (req, res) => {
        var username = req.body.username;
        var user = await User.findOne({username});
        if (!user) {
            throw new AccessDeniedError();
        }

        var hash = utils.passwordHash(req.body.password, user.salt);

        if (hash !== user.passwordHash) {
            throw new AccessDeniedError();
        }

        req.session.user = user._id;
        req.session.username = username;

        res.status(200);
        res.end();
    },
    logout: async (req, res) => {
        delete req.session.user;

        res.status(200);
        res.end();
    },
    getPlan: async (req, res) => {
        var plan = await Plan.findOne({_id: req.params.id});
        res.json(plan);
    },
    postPlans: async (req, res) => {
        var plan = await new Plan(req.body).save();
        res.json(plan);
    },
    patchPlan: async (req, res) => {
        var plan = await Plan.findOne({_id: req.params.id});
        plan.patch(req.body, function (err, doc) {
            res.json(doc);
        });
    },
    deletePlan: async (req, res) => {
        await Plan.remove({_id: req.params.id});
        res.status(200);
        res.end();
    },
    getResult: async (req, res) => {
        var result = await Result.findOne({_id: req.params.id});
        res.json(result);
    },
    postResults: async (req, res) => {
        var result = await new Result(req.body).save();
        res.json(result);
    },
    patchResult: async (req, res) => {
        var result = await Result.findOne({_id: req.params.id});
        result.patch(req.body, function (err, doc) {
            res.json(doc);
        });
    },
    deleteResult: async (req, res) => {
        await Result.remove({_id: req.params.id});
        res.status(200);
        res.end();
    },
    getProjects: async (req, res) => {
        var projects = await Project.find({userId: req.session.user});
        res.json(projects);
    },
    postProjects: async (req, res) => {
        req.body.userId = req.session.user;

        var project = await new Project(req.body).save();
        res.json(project);
    },
    patchProjects: async (req, res) => {
        var project = await Project.findOne({_id: req.params.id});
        project.patch(req.body, function (err, doc) {
            res.json(doc);
        });
    },
    deleteProject: async (req, res) => {
        await Project.remove({_id: req.params.id});
        res.status(200);
        res.end();
    },
    robots: async (req, res) => {
        res.write(ROBOTS_TXT);
        res.end();
    },
    error: (err, req, res, _) => {
        logger.error(err);

        if (err instanceof AccessDeniedError) {
            res.status(401);            
        } else {
            res.status(500);            
        }

        res.format({
            text: function () {
                res.send(err.message || err);
            },
            json: function () {
                res.send({error: err.message || err});
            },
            html: function () {
                res.render('error', {
                    error: err
                });
            }
        });
    }
};
