const fileUpload = require('express-fileupload');
const express    = require('express');
const cors       = require('cors');
const kugel      = require('kugel');

require('./routerMiddleware');
require('./component.js');

const Component = kugel.Component;

let expressMiddleware = Component.get('express-middleware');

// console.log(expressMiddleware, process.env['kugel-Component'])

let config = require(process.env.ROOT + '/package.json').kugel.config;

let router = new express.Router();

module.exports = {

    routes: {},

    router(prefix, toRoute){

        if(typeof prefix === 'function'){

            toRoute = prefix;
            prefix  = '';

        }

        Component.on('express-listen', (app) => {

            let routerFunctions = {};

            Component.get('routerMethods').stack.forEach(subMethod => {

                subMethod(router, routerFunctions, module.exports, app);
    
            });

            try{

                toRoute(routerFunctions);

            } catch(e){

                console.log('Router error', e);

            }

            // Caso a rota esteja prefixada
            if(prefix){

                return app.use(prefix, router);

            }

            app.use(router);

        });

    }

}

if(config.upload){

    console.log('Upload enabled');

    expressMiddleware.add(fileUpload());

}

if(config.body_parser){

    expressMiddleware.add(express.json({

        limit: process.env.BODYPARSER_LIMIT || '10mb'

    }));

    expressMiddleware.add(express.urlencoded({

        limit: process.env.BODYPARSER_LIMIT || '10mb',
        extended: true

    }));

}

if(config.cors){

    expressMiddleware.add(cors({
        origin: config.cors.origin || '*',
        methods: config.cors.methods || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: config.cors.headers || ['Content-Type', 'Authorization', 'X-Requested-With'],
        credentials: config.cors.credentials || true,
        optionsSuccessStatus: config.cors.optionStatus || 200,
        preflightContinue: config.cors.preflightContinue || false
    }));

}
