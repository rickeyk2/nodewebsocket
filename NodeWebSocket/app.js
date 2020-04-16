const WebSocket = require('ws');
const portNumber = process.env.port || 5001;

const wss = new WebSocket.Server({ port: portNumber });
 
const https = require('https');
 
wss.broadcastAll = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};


wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
  	var obj = JSON.parse(message);
    console.log('received: %s', message);
    if (obj.eventname == "chatmessage") {
    	var username = obj.payload.username;
    	var initial = "";
    	var nameArr = username.split(" ");
    	if (nameArr.length > 1) {
    		initial = nameArr[0].substring(0,1)+nameArr[1].substring(0,1)
    	}
    	else {
    		initial = username.substring(0,2);
    	}
    	var outgoing = JSON.stringify({
    		username:username,
    		message:obj.payload.message,
    		initial:initial,
    		eventname:obj.eventname
    	});
	    // Broadcast to everyone else.
	    wss.clients.forEach(function each(client) {
	      if (client !== ws && client.readyState === WebSocket.OPEN) {
	      	if(client.chatid == ws.chatid) {
	         client.send(outgoing);
	      	}
	      }
	    });
	}
	if (obj.eventname == "newuser") {
		ws.chatid = obj.chatid;
		var username = obj.payload.username;
		var initial = "";
    	var nameArr = username.split(" ");
    	if (nameArr.length > 1) {
    		initial = nameArr[0].substring(0,1)+nameArr[1].substring(0,1)
    	}
    	else {
    		initial = username.substring(0,2);
    	}
		var outgoing = JSON.stringify({
    		username:username,
    		message:obj.payload.message,
    		initial:initial,
    		eventname:obj.eventname
    	});
		wss.clients.forEach(function each(client) {
	      if (client !== ws && client.readyState === WebSocket.OPEN) {
	      	if(client.chatid == ws.chatid) {
	         client.send(outgoing);
	      	}
	      }
	    });
	}
	if (obj.eventname == "typing") {
		var outgoing = JSON.stringify({
    		username:username,
    		message:obj.payload.message,
    		initial:initial,
    		eventname:obj.eventname
    	});
		wss.clients.forEach(function each(client) {
	      if (client !== ws && client.readyState === WebSocket.OPEN) {
	      	if(client.chatid == ws.chatid) {
	         client.send(outgoing);
	      	}
	      }
	    });
	}
  });
});
