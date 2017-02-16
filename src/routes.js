import fs from 'fs';

import logger from 'winston';
import solve from 'guillotine-solver';

import translate from './adapter';
import utils from './utils';

import User from './db/user';

const ROBOTS_TXT = fs.readFileSync(__dirname + '/../robots.txt');

var cutlists = {};

function AccessDeniedError () {
    this.message = 'Access denied.';
    Error.call(this);
}
AccessDeniedError.prototype = Object.create(Error.prototype);
AccessDeniedError.prototype.constructor = AccessDeniedError;

export default {
    root: async (req, res) => {
        res.render('index.jade', {
            loggedIn: !!req.session.user
        });
    },
    lang: async (req, res) => {
        res.cookie('cutlistlang', req.body.lang);
        res.status(200).end();
    },
    cutlist: async (req, res) => {
        var stocks = req.body.slates;
        var parts = req.body.parts;
        var type = req.body.cutType;
        var itemsw = [];
        var itemsh = [];
        var demands = [];
        var names = [];
        var canRotate = [];

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

        solve(stocks.map(s => s.w), stocks.map(s => s.h), itemsw, itemsh, canRotate, demands, type, (_, result) => {
            cutlists[key] = translate(result, names, type);
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

        res.status(200).end();
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