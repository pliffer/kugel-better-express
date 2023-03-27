const Components = require('kugel-components');

// Metodos que esse manipulador de rotas suporta
let methods = ['get', 'post', 'put', 'patch', 'delete'];

// Cria um manipulador de rotas personalizado
Components.get('routerMethods').add((router, routerMethods, moduleExports, app) => {

    app.locals.basedir = process.env.ROOT;

    // Para cada método HTTP
    for(let method of methods){

        // Define um manipulador de rota personalizado para o método
        routerMethods[method] = (route, ...args) => {

            // Obtém o último argumento
            let last   = args[args.length - 1];

            // Obtém os argumentos exceto o último
            let middle = args.slice(0, args.length - 1);

            // Inicializa o array de rotas para o método, se necessário
            moduleExports.routes[method] ??= [route];

            // Adiciona a rota ao array de rotas do método
            router[method](route, async (req, res, next) => {

                // Executa os middlewares
                for(let f of middle) await f(req, res, next);

                // @todo Remove render when there's no template engine
                // @todo Remove files when there's no file upload

                let result = await last({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                    files: req.files,
                    render: (pugFile, opts) => {

                        res.render(pugFile, opts);

                        return {
                            propagate: false
                        }

                    },
                    req,
                    res
                });

                if(!result) return;

                // Retorna o resultado da função
                res.promiseStd(result);

            });

        }

    }

});