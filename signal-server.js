/*
Boilerplate from: https://medium.com/nerd-for-tech/peer-to-peer-chat-app-using-webrtc-and-react-native-6c15759f92ec#id_token=eyJhbGciOiJSUzI1NiIsImtpZCI6IjY3NmRhOWQzMTJjMzlhNDI5OTMyZjU0M2U2YzFiNmU2NTEyZTQ5ODMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYmYiOjE2ODkwMzgyMzgsImF1ZCI6IjIxNjI5NjAzNTgzNC1rMWs2cWUwNjBzMnRwMmEyamFtNGxqZGNtczAwc3R0Zy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjEwNTE2ODY1NTMwNTM4MDM3MTg0NSIsImVtYWlsIjoiY2FtZXJvbmJkaWNraWVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF6cCI6IjIxNjI5NjAzNTgzNC1rMWs2cWUwNjBzMnRwMmEyamFtNGxqZGNtczAwc3R0Zy5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsIm5hbWUiOiJDYW1lcm9uIERpY2tpZSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQWNIVHRjaFNmdTlpQUVaZTdUSThSdXpVem1SZXBXVWt3WWFxRnVyeEU4TEN3MDU9czk2LWMiLCJnaXZlbl9uYW1lIjoiQ2FtZXJvbiIsImZhbWlseV9uYW1lIjoiRGlja2llIiwiaWF0IjoxNjg5MDM4NTM4LCJleHAiOjE2ODkwNDIxMzgsImp0aSI6IjI5ZTRhY2QzYjQ4NzBjMWIxNzc1NDBhOGE2MjAyYzM4N2FhNTI0NTYifQ.ZVm0MXLtcqHeUviqvQjJsrMi60iPY5ZhV7c6ClUV0LMXSj-rAiWeC5PxLfoM3LwbW66n2nYsurJ8YjmLZrpRF3vvOzdTXuvAqcEVV0Yx-VIQk-dnJakvigFc1IS618B_1jSTp25ZW6V0GVbwZ_cAg7cTpN5KsT_-OxdAMlYjeUDubgr7cnfaTu5i0Ti4XEGJcqcUB2qWtXWaErUt502KIj0y_pNBPPeO2VdsYFcnzDGPCwv3XO9ieFQj82Epq9c6gRaYKOMTzvI9iP7lWnxjEMZSTe8jVDYyK67NYpngQBoo4PrMziawgrJeQzESX9l2xdDHu9sY7mnP08DMsM7h9A'

*/

const express = require('express');
const http = require('http');
const app = express();
const socket = require('socket.io');

const families = {};
app.get('/', (req, res) => {
  res.send('hello i am a route');
});

const server = http.createServer(app);
const io = socket(server);

io.on('connection', socket => {
  /*
        If a peer is initiator, he will create a new room
        otherwise if peer is receiver he will join the room
    */
  socket.on('joinFamily', (famID, cb) => {
    console.log('joinFamily was run');
    if (families[famID]) {
      // Receiving peer joins the room
      families[famID].push(socket.id);
      console.log('family joined');
      cb(true);
    } else {
      // Joining a family that doesn't exist should not work. return a failure
      console.log(
        socket.id + " just attempted to join a family that doesn't exist",
      );
      cb(false);
    }

    /*
            If both initiating and receiving peer joins the room,
            we will get the other user details.
            For initiating peer it would be receiving peer and vice versa.
        */
    // const otherUser = rooms[roomID].find(id => id !== socket.id);
    // if (otherUser) {
    //   socket.emit('other user', otherUser);
    //   socket.to(otherUser).emit('user joined', socket.id);
    // }
  });

  socket.on('createFamily', (famID, cb) => {
    console.log('createFamily was run');
    if (families[famID]) {
      //this family has already been created, as such this route should not work
      cb(false);
    } else {
      families[famID] = [socket.id];
      cb(true);
    }
  });
  /*
        The initiating peer offers a connection
    */
  socket.on('offer', payload => {
    io.to(payload.target).emit('offer', payload);
  });

  /*
        The receiving peer answers (accepts) the offer
    */
  socket.on('answer', payload => {
    io.to(payload.target).emit('answer', payload);
  });

  socket.on('ice-candidate', incoming => {
    io.to(incoming.target).emit('ice-candidate', incoming.candidate);
  });
});

server.listen(9000, () => console.log('Server is up and running on Port 9000'));
