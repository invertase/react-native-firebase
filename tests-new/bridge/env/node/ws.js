const WebSocket = require('ws');

const ws = new WebSocket(
  'ws://localhost:8081/debugger-proxy?role=debugger&name=Chrome'
);

ws.onmessage = message => process.emit('ws-message', JSON.parse(message.data));
ws.onclose = event => (!event.wasClean ? console.log('WS close', event) : '');

module.exports = ws;
