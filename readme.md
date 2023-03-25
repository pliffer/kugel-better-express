# Better Express

Extensão do express, para que haja mais padronização no tratamento de erros, retorno REST, upload de arquivos, autenticação e configurabilidade.

Para sua ativação, é necessário que o package.json do projeto possua .kugel.modules e esteja dentro do .core, pela sua necessidade de carregar antes de outros recursos.

## Uso

Quando o módulo está ativo, o kugel carrega todos os arquivos dentro de app/routes e passa uma instância de better express, como router, no lugar do padrão do express. Isso significa que a seguinte sintaxe pode ser utilizada:

```
let controller = require(global.dir.controllers + '/products.js');

module.exports  = (router) => {
	router.jwt.get('/', controller.public.getAll);
	router.jwt.get('/:id', controller.public.getOne);
	router.jwt.post('/', controller.public.create);
	router.jwt.put('/:id', controller.public.update);
	router.jwt.delete('/:id', controller.public.delete);
}
module.exports.route =  '/v2/products';
```
```module.exports``` sempre receberá no argumento o router, proveniente do better express, onde expõe os seguintes métodos: .jwt.get, .get, .jwt.post, .post, .jwt.put, .put, .rawGet (nativo do express)

A concepção das rotas é feita 

## Autenticação

router.jwt.get, router.jwt,post e router.jwt.put requerem que a requisição possua o Bearer token sendo passado, portanto no caso do usuário não disponibiliza-lo, ocorrerá um status code 401

Usa o módulo kugel jwt, portanto aceita as seguintes chaves para o header do token: Authorization, jwt ou x-access-token

## Tratamento de erros

Sempre que houver algum status code, ou erro de throw (no caso do Promise.reject) será armazenado dentro do módulo Logs, garantindo que absolutamente todos os erros sejam analisados posteriormente

## Configurações

"cors": true,
Garante que os headers de cors sejam definidos de acordo

"jwt": true,
Habilita a autenticação através do JWT

"directResponse": true,
Torna as respostas do better express (antes em .message) disponíveis como RESTFULL (então agora o payload vai direto na requisição e o status code no .status)