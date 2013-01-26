
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var ws = require('websocket.io');

var points = [];

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app);

socket = ws.attach(server);

socket.on('connection',function(client){

  if(points.length > 0){
    for(var i in points){
      client.send(points[i]);
    }
  }

  client.on('message',function(message){
    if(message.indexOf('@') > -1){
      points = [];
    }else{
      points.push(message);
    }
    socket.clients.forEach(function(client){
      client.send(message);
    });
  });
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});