const fs = require('fs');
const spawn = require('child_process').spawn;
const path = require('path');
const os = require('os');

var logger = require('winston');

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
        res.render('index.pug', {
            userId: req.session.user,
            username: req.session.username
        });
    },
    lang: async (req, res) => {
//        res.cookie('cutlistlang', req.body.lang);
        res.status(200).end();
    },
    cutlist: async (req, res) => {
        fs.mkdtemp(path.join(os.tmpdir(), 'cutlist-'), (err, dir) => {
            if (err) {
                throw err;
            }

            const filename = String(Date.now(), 36);
            const filepath = path.join(dir, filename);

            fs.writeFileSync(filepath, JSON.stringify(req.body, null, '\t'), {
              encoding: 'utf-8'
            });
            const optimalon = spawn(path.resolve('./optimalon/bin/Debug/net5.0/optimalon'), [filepath]);

            const lineBuffs = [];
            const errorBuffs = [];
            optimalon.stdout.on('data', (data) => {
              lineBuffs.push(data);
            });

            optimalon.stderr.on('data', (data) => {
              errorBuffs.push(data);
            });

            optimalon.on('close', (code) => {
              console.log(`child process exited with code ${code}`);
              if (code === 0) {
                const str = Buffer.concat(lineBuffs).toString('utf-8');
                console.log(str);
                cutlists[key] = translate(str.split(os.EOL), req.body.parts.reduce((acc, part) => {
                    return acc.concat(new Array(part.q).fill(part.name));
                }, []));
              } else {
                const str = Buffer.concat(errorBuffs).toString('utf-8');
                console.error(str);
                cutlists[key] = str;
              }
            });

            var key = (Math.random() * 1e18).toString(36);

            res.send(key).end();
        });
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
