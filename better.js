const fileUpload = require('express-fileupload')
const express    = require('express')
const path       = require('path')
const fs         = require('fs-extra')
const cors       = require('cors')

const Components = require('../../../kugel-components')

let expressMiddleware = Components.get('express-middleware');

let config = require(process.env.ROOT + '/package.json').kugel.config;

require('./routerMiddleware');

module.exports = {

    routes: {},

    router(prefix, toRoute){

        if(typeof prefix === 'function'){

            toRoute = prefix;
            prefix  = '';

        }

        let router = new express.Router();

        Components.on('express-listen', (app) => {

            let routerFunctions = {};

            Components.get('routerMethods').stack.forEach(subMethod => {
    
                subMethod(router, routerFunctions, module.exports, app);
    
            });
    
            toRoute(routerFunctions);
    
            // Caso a rota esteja prefixada
            if(prefix){

                return app.use(prefix, router);

            }

            app.use(router);

        });

    }

}

expressMiddleware.add((req, res, next) => {

    res.promiseStd = (promise) => {

        // Turn the result into a promise
        if(promise && !promise.then) promise = Promise.resolve(promise);

        if(!promise) {

            res.status(102);
            return res.send('No Content');

        }

        promise.then(result => {

            if(!result) result = {};

            // Se for definido que a resposta não deve ser propagada
            if(result.propagate === false) return;

            // @todo O que fazer quando um item possui .status, mas não deveria ser o status code?
            if(result.statusCode){
                
                res.status(result.statusCode);
                delete result.statusCode;

            }

            if(result.headers){

                for(let header in result.headers){

                    res.setHeader(header, result.headers[header]);

                }

                delete result.headers;

            }

            if(result.file){

                return res.sendFile(result.file);

            }

            // @test
            if(result.redirect) return res.redirect(result.redirect);

            if(result.result){
                    
                result = result.result;

            }

            if(typeof result === 'string') return res.send(result);

            res.json(result);

        }).catch(e => {

            res.status(e.status || 500);

            if(typeof e === 'undefined') {

                return res.send("Internal Server Error");

            }

            let message = e.message || '';

            console.error('@error'.yellow, 'at', req.originalUrl, e);

            return res.json(message);

        });

    }

    next();

});

// compileViews(){

//     if(!global.config.compileViews) return;

//     let compileViewsPath = path.join(global.dir.app, global.config.compileViews);

//     let files   = [];
//     let folders = [];

//     return new Promise((resolve, reject) => {

//         fs.ensureDirSync(compileViewsPath);

//         let walk = walkdir(compileViewsPath);

//         walk.on('file', (asset) => {

//             console.log(asset);

//             let viewFolder = asset.replace(compileViewsPath, '').replace(path.basename(asset), '');

//             // @todo Melhorar essa questão do \\ ou /, pois depende do sistema operacional
//             if(viewFolder !== '\\' && viewFolder !== '/' && !folders.includes(viewFolder)){

//                 folders.push(viewFolder);

//             }

//             files.push(asset);

//         });

//         walk.on('end', () => {

//             resolve(files);

//         });

//     }).then(() => {

//         let folderPromise = [];

//         folders.forEach(folder => {

//             let compiledFolder = path.join(global.dir.app, global.config.compiledViewsDest, folder);

//             folderPromise.push(fs.ensureDir(compiledFolder));

//         });

//         return Promise.all(folderPromise);

//     }).then(() => {

//         let filePromise = [];

//         files.forEach(file => {

//             // @todo Entender os perigos na segurança que isso pode causar
//             global.config.viewsOptions.require = require;
//             global.config.viewsOptions.pretty  = true;

//             let viewContent = pug.renderFile(file, global.config.viewsOptions);

//             let viewFilename = file.replace(compileViewsPath, '');

//             viewFilename = viewFilename.replace(path.extname(viewFilename), '.html');

//             let compiledViewDest = path.join(global.dir.app, global.config.compiledViewsDest, viewFilename);

//             filePromise.push(fs.writeFile(compiledViewDest, viewContent, 'utf-8'));

//         });

//         return Promise.all(filePromise);

//     });

// }

// if(config.session){

//     expressMiddleware.add(session(config.session));

// }

if(config.upload){

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
