var restify  = require('restify');
var fs       = require('fs');
var path     = require('path');
/**
 * Configurar puerto de escucha del server
 * @type {Number}
 */
var http_port = 80;
/**
 * Instancia de server Restify
 * @type {Object}
 */
var server = restify.createServer({ name: 'UserLogger' });
/**
 * Dirección en fileserver del txt donde se guardan los mails
 * @type {String}
 */
var emails = path.resolve(__dirname, '.', 'public/emails.txt');
/*
   Configuración de servidor Restify
 */
server.use(restify.fullResponse());
server.use(restify.bodyParser());
/**
 * POST Handler para registrar los correos en el txt
 * @param  {Request Object}
 * @param  {Response Object}
 * @param  {Next Function on Stack}
 * @return {Void}
 */
server.post('/', function(req, res, next){
  var email = processEmail(req.params.email);
  if (!email) return res.send(500);
  fs.appendFile(emails, email + '\n', function(err){
    if (err) handleError(err, res);
    res.send(200);
  });
});
/**
 * Realiza distintas validaciones del valor del email y lo guarda en un log
 * @param  {String}
 * @return {String o False}
 */
function processEmail(email){
  if (emailIsNotEmpty(email) && emailIsString(email) && emailIsValid(email) && emailIsUnique(email)){
    return email.toLowerCase();
  }
  return false;
}
/**
 * Verífica que exista o este definido el email
 * @return {[type]}
 */
function emailIsNotEmpty(){
  if (!email || email === ''){
    console.log('Email is undefined or empty');
    return false;
  }
  return true;
}
/**
 * Verifica que el valor del email sea un string
 * @return {String}
 */
function emailIsString(){
  if (!(typeof email = 'string')){
    console.log('Email value must be a string');
    return false;
  }
  return true;
}
/**
 * Verifica que el email tenga el formato apropiado de un email
 * @param  {String}
 * @return {Boolean}
 */
function emailIsValid(email){
  var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  return re.test(email);
}
/**
 * Verifica que no este correo no este ya registrado en el archivo de texto
 * @param  {String} 
 * @return {Boolean}
 */
function emailIsUnique(email){
  fs.readFile(emails, function(err, data){
    if (err) return false;
    if (data.indexOf(email.toLowerCase()) < 0) {
      console.log('Email already exists');
      return false;
    }
  });
  return true;
}
/**
 * Función encargada de registrar el error y enviar un mensaje 500 al cliente
 * @param  {[type]}
 * @param  {[type]}
 * @return {[type]}
 */
function handleError(err, res){
  console.log(err);
  res.send(500);
  return;
}
/**
 * Publicación de documentos estaticos. El default es la pagina 'login.html'
 * @type {String}
 */
server.get(/\/?.*/, restify.serveStatic({
  directory: './public',
  default  : 'login.html'
}));
/**
 * Inicio del servidor
 * @param  {String, Function}
 * @return {Void}
 */
server.listen(http_port, function(){
  console.log('%s listening at %s', server.name, server.url);
});