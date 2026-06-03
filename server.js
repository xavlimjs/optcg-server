const { WebSocketServer } = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocketServer({ server });

const rooms = {};

wss.on('connection', (ws, req) => {
  const roomCode = req.url.split('/room/')[1];
  
  if (!roomCode) { ws.close(); return; }
  
  if (!rooms[roomCode]) rooms[roomCode] = new Set();
  rooms[roomCode].add(ws);
  
  ws.on('message', (data) => {
    rooms[roomCode].forEach(client => {
      if (client !== ws && client.readyState === 1) {
        client.send(data.toString());
      }
    });
  });
  
  ws.on('close', () => {
    rooms[roomCode]?.delete(ws);
    if (rooms[roomCode]?.size === 0) delete rooms[roomCode];
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));