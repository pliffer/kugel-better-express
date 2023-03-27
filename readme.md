# Kugel Better Express

 Pacote do kugel, para extender o express no intuito que haja mais padronização no tratamento de erros, retorno REST, upload de arquivos, autenticação e outras configurações.

Para sua ativação, é necessário que "kugel-better-express" esteja dentro de alguma das propriedades de inicalização dentro do .kugel do package.json.  

## Uso

Quando o módulo está ativo, o ele popula um método do `kugel-server` para que as requisições sejam abstraídas da seguinte maneira:
```
let betterExpress = require('kugel-better-express');

betterExpress.router(router => {
    router.get('/', ({render}) => render('index.pug'));
});

```
A funão router, retorna um router, instância do express que está rodando no atual processo. Esse router já tem abstraído todas as funções, portanto no caso do módulo `kugel-jwt` estar ativado, o método router.jwt.get e outros estarão também disponíveis.

Recomenda-se o desconstrutor para obter a função que será utilizada na rota, assim como pode-se também simplesmente pegar o objeto inteiro, que possui as seguintes propriedades: `{body, query, params, files, render, req, res}`.

Render está disponível no caso de uma configuração de uma template-engine, onde equivale ao res.render.

A concepção das rotas é feita da mesma maneira que o express.

## Tratamento de erros

Pode-se definir o status da resposta desconstruindo o res, da seguinte maneira: 

```
let betterExpress = require('kugel-better-express');

betterExpress.router(router => {
    router.get('/:id', ({params, res}) => {
	
		if(!req.headers['not-human']){
			res.status(500);
			return "Erro interno, essa rota não é permitida para humanos";
		}
		
		return "Ok :D";
		
   });
});

```

## Configurações

Esse módulo possui as seguintes configurações:  `"cors", "upload", "template_engine", "body_parser"`.

### cors

@params: object

O cors possui os seguintes atributos:

origin, valor da origem aceita pelo cors, default: *
methods, métodos aceitos pelo cors, default: `['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']`
headers, headers aceitos pelo cors, deafult: `['Content-Type', 'Authorization', 'X-Requested-With']`
credentials, descrição incompleta, default: `true`
optionStatus, status padrão para o método option, default: `200`
preflightContinue, descrição incompleta, default: `false`

### upload

@params: boolean
@description: Ativa o módulo de upload file_upload

### template_engine
@params: text, nome da template engine

Nota: É necessário instalar a template engine, mesmo após configurada no config;

### body_parser

@params: bool
@description: Habilita requisições do tipo [post]