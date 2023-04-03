const kugel = require('kugel');

let expressMiddleware = kugel.Component.get('express-middleware');

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