const vm = require('./vm');
const WebSocket = require('ws');

const ws = new WebSocket(
  'ws://localhost:8081/debugger-proxy?role=debugger&name=Chrome'
);

vm.reply = obj => ws.send(JSON.stringify(obj));

ws.onmessage = message => vm.message(JSON.parse(message.data));

ws.onclose = event =>
  !event.wasClean ? console.error('Bridge WS Error', event.message) : '';

module.exports = ws;
