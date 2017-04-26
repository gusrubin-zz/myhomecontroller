var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('ssl/server.key', 'utf8');
var certificate = fs.readFileSync('ssl/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

var fileTest = 'states.json';
var pathGPIO = '/sys/class/gpio/gpio';
var configFile = 'config.json';
var objLuz = {};
var express = require('express');
var app = express();

function noOp() {}

app.use(function (req, res, next) {
	console.log('Time:', new Date().toISOString());
	next();
});

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json

function readFile(file) {
	try {
		var data = JSON.parse(fs.readFileSync(file, 'utf8'));
		console.log('Lido arquivo %s', file);
		return data;
	} catch (e) {
		console.log('Error:', e.stack);
	}
}

function writeFile(file, data) {
	try {
		var dataOut = fs.writeFileSync(file, data, 'utf8');
		console.log('Atualizado arquivo %s', file);
		return dataOut;
		} catch (e) {
		console.log('Error:', e.stack);
	}
}

function writeGPIO(gpio, status) {
	var file = pathGPIO + gpio + '/value';
	var estado;
	if (status == "on") {
		estado = 0;
	} else {
		estado = 1;
	}
	writeFile(file, estado);
	persistConfig();
}

function persistConfig() {
	var dados = JSON.stringify(config);
	writeFile(configFile, dados);
}

//App startup

//Levantar mapeamento de GPIOs no config.json
console.log("Construindo mapa de GPIOs:");
var config = readFile(configFile); //Lê arquivo de configuração e estados das GPIOs

var sys = require('util')
var exec = require('child_process').exec;

function puts(error, stdout, stderr) { sys.puts(stdout) }

var sysFsPath = '/sys/class/gpio';
var pinMapping = {
  '0': 2,
  '1': 3,
  '2': 4,
  '3': 5
};

/*
function writeConfigGPIO(gpio, direction) {
	exec("echo " + gpio + " > /sys/class/gpio/export; echo " + direction + " > /sys/class/gpio/gpio" + gpio + "/direction", puts);
}*/

function createConfigGPIO(gpio, direction, callback) {
	try {
		pahtDirection = sysFsPath + "/gpio" + gpio + "/direction";
		if (!fs.existsSync(pahtDirection)) { //Checa se arquivos existem
			exec("echo " + gpio + " > /sys/class/gpio/export", puts);
		}
		writeFile(pahtDirection, direction, (callback || noOp));
	} catch (e) {
		console.log('Error:', e.stack);
	}
}

function updateStateGPIO(gpio, value, callback) {
	try {
		pathValue = sysFsPath + "/gpio" + gpio + "/value";
		fs.writeFile(pathValue, value, (callback || noOp));
	} catch (e) {
		console.log('Error:', e.stack);
	}
}

function setupGPIO(gpio, value, callback) {
	return callback(gpio, value, noOp);
}

function gpios(action) {
	switch(action) {
    case "listAll":
		var item = Object();
		var jsonResult = [];
		for(var ambiente in config.ambientes){
			for(var dispositivo in config.ambientes[ambiente].dispositivos){
				var gpio = config.ambientes[ambiente].dispositivos[dispositivo].gpio;
				var amb = config.ambientes[ambiente].nome;
				var nome = config.ambientes[ambiente].dispositivos[dispositivo].nome;
				var tipo = config.ambientes[ambiente].dispositivos[dispositivo].tipo;
				var estado = config.ambientes[ambiente].dispositivos[dispositivo].detalhes.estado;
				//console.log("GPIO " + gpio + " = " + nome + " do tipo " + tipo + " em " + amb + " no estado " + estado);
				item = {"GPIO":gpio,"nome":nome,"tipo":tipo,"ambiente":amb,"estado":estado};
				console.log(item);
				jsonResult.push(item);
			}
		}
		return jsonResult
        break;
    case "listActive":
		var item = Object();
		var jsonResult = [];
		for(var ambiente in config.ambientes){
			for(var dispositivo in config.ambientes[ambiente].dispositivos){
				var gpio = config.ambientes[ambiente].dispositivos[dispositivo].gpio;
				if (gpio != null){
					var amb = config.ambientes[ambiente].nome;
					var nome = config.ambientes[ambiente].dispositivos[dispositivo].nome;
					var tipo = config.ambientes[ambiente].dispositivos[dispositivo].tipo;
					var estado = config.ambientes[ambiente].dispositivos[dispositivo].detalhes.estado;
					//console.log("GPIO " + gpio + " = " + nome + " do tipo " + tipo + " em " + amb + " no estado " + estado);
					item = {"GPIO":gpio,"nome":nome,"tipo":tipo,"ambiente":amb,"estado":estado};
					console.log(item);
					jsonResult.push(item);
				}			
			}
		}
		return jsonResult		
        break;
    case "setUpdate":
        for(var ambiente in config.ambientes){
			for(var dispositivo in config.ambientes[ambiente].dispositivos){
				var gpio = config.ambientes[ambiente].dispositivos[dispositivo].gpio;
				if (gpio != null){
					if (config.ambientes[ambiente].dispositivos[dispositivo].tipo == 'saida_digital'){
						setupGPIO(gpio, 'out', createConfigGPIO);
						var state;
						if (config.ambientes[ambiente].dispositivos[dispositivo].detalhes.estado == "on") {
							state = 0;
						} else {
							state = 1;
						}
						updateStateGPIO(gpio, state, updateStateGPIO);
					}		
				}
			}
		}
	}
}
gpios('setUpdate');
gpios('listActive');

//

function ambientes(action, id_ambiente, id_dispositivo, estado) {
	switch(action) {
    case "listAll":
		var item = Object();
		var jsonResult = [];
		for (var ambiente in config.ambientes) {
			item = {"id":config.ambientes[ambiente].id,"ambiente":config.ambientes[ambiente].nome,"ativo":config.ambientes[ambiente].ativo};
			jsonResult.push(item);
			console.log(item);
		}
		return jsonResult;
        break;
    case "showDetails":
		var item = Object();
		item = config.ambientes[id_ambiente];
		return item;
        break;
	case "showEstadoDispositivo":
		var item = Object();
		item = {"estado":config.ambientes[id_ambiente].dispositivos[id_dispositivo].detalhes.estado};
		return item;
        break;
    case "updateItem":
		var gpio = config.ambientes[id_ambiente].dispositivos[id_dispositivo].gpio;
		config.ambientes[id_ambiente].dispositivos[id_dispositivo].detalhes.estado = estado;
		writeGPIO(gpio, estado);
		return {"estado":estado};
	}
}

function open(pinNumber, direction, callback) {
  const path = sysFsPath + '/gpio' + pinMapping[pinNumber] + '/direction';
  const pathValue = sysFsPath + '/gpio' + pinMapping[pinNumber] + '/value';

  var state = readFile(fileTest).status;
	console.log('state: ' + state);
	if (state == "on") {
		fs.writeFile(pathValue, 0, 'utf8', callback);
	} else {
		fs.writeFile(pathValue, 1, 'utf8', callback);
	}
  fs.writeFile(path, direction, (callback || noOp));
}

//open(1, 'out', noOp());

function write(pinNumber, value, callback) {
  const path = sysFsPath + '/gpio' + pinMapping[pinNumber] + '/value';
  value = !!value ? '1' : '0';

  fs.writeFile(path, value, 'utf8', callback);
}

app.route('/configs')
.get(function (req, res) {
	console.log('Recebido GET /configs');
	var body = readFile(configFile);
	var jsonBody = JSON.stringify(body);
	res.json(body);
	console.log('Retornado %s\n', jsonBody);
});

app.route('/gpios')
.get(function (req, res) {
	console.log('Recebido GET /gpios');
	var jsonBody = gpios('listAll');
	res.json(jsonBody);
	console.log('Retornado %s\n', jsonBody);
});

app.route('/gpios/active')
.get(function (req, res) {
	console.log('Recebido GET /gpios');
	var jsonBody = gpios('listActive');
	res.json(jsonBody);
	console.log('Retornado %s\n', jsonBody);
});

app.route('/ambientes')
.get(function (req, res) {
	console.log('Recebido GET /ambientes');
	var jsonBody = ambientes('listAll');
	res.json(jsonBody);
	console.log('Retornado %s\n', jsonBody);
});

app.route('/ambientes/:id')
.get(function (req, res) {
	console.log('Recebido GET /ambientes');
	var jsonBody = ambientes('showDetails', req.params.id);
	res.json(jsonBody);
	console.log("id" + req.params.id);
	console.log('Retornado %s\n', jsonBody);
})

app.route('/ambientes/:id_ambiente/dispositivos/:id_dispositivo/estado')
.get(function (req, res) {
	console.log('Recebido GET /ambientes/:id_ambiente/dispositivos/:id_dispositivo/estado');
	var jsonBody = ambientes('showEstadoDispositivo', req.params.id_ambiente, req.params.id_dispositivo);
	res.json(jsonBody);
	console.log('Retornado %s\n', JSON.stringify(jsonBody));
})
.put(function (req, res) {
	var jsonBody = JSON.stringify(req.body);
	var json = req.body;
	console.log('Recebido PUT ambientes/:id_ambiente/dispositivos/:id_dispositivo/estado com o body %s', jsonBody);
	ambientes('updateItem', req.params.id_ambiente, req.params.id_dispositivo, json.estado);
	console.log('updateItem' + " " + req.params.id_ambiente + " " + req.params.id_dispositivo + " " + json.estado);
	res.json(json);
	console.log('Retornado %s\n', json.estado);
});

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(8080);
httpsServer.listen(8443);