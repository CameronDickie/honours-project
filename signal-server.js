const express = require('express');
const http = require('http');
const socket = require('socket.io');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); // Require bcrypt for hashing
const {parse, stringify} = require('flatted');

const app = express();
const SALT_ROUNDS = 10; // Number of salt rounds for bcrypt hashing

app.use(bodyParser.json());

class UserManager {
  constructor() {
    this.users = {};
  }

  getOnlineUsers() {
    return Object.keys(this.users).filter(email => this.users[email].online);
  }

  /**
   * Create a new family member from the provided signup data.
   *
   * @param {Object} data - The signup data
   * @returns {FamilyMember} - The new family member
   */
  async createUserFromSignup(data) {
    const {email, password} = data;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = {
      email,
      password: hashedPassword,
      socketConnection: null,
      online: false,
    };

    this.users[email] = newUser;
    return newUser;
  }

  getUserByEmail(email) {
    return this.users[email] || null;
  }

  setUserOnline(email, socketId) {
    const user = this.getUserByEmail(email);
    if (user) {
      user.online = true;
      user.socketConnection = socketId;
    }
  }

  setUserOffline(email) {
    const user = this.getUserByEmail(email);
    if (user) {
      user.online = false;
      user.socketConnection = null;
    }
  }

  // Function to send error messages.
  handleError(clientSocket, errorMessage) {
    // ... Send error message to the client.
  }
}

const userManager = new UserManager();

app.post('/signup', async (req, res) => {
  const data = req.body;
  const {email} = data;

  // Check if email (user) already exists
  const existingUser = userManager.getUserByEmail(email);

  if (existingUser) {
    return res.status(400).json({error: 'User already exists'});
  }

  const newUser = await userManager.createUserFromSignup(data);
  res.json({success: true, data: newUser});
});

app.post('/login', async (req, res) => {
  const {email, password} = req.body;

  const existingUser = userManager.getUserByEmail(email);

  if (!existingUser) {
    return res.status(400).json({error: 'User does not exist'});
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    existingUser.password,
  );

  if (isPasswordCorrect) {
    // In a real-world scenario, here you would generate a session/token and send it to the client.
    res.json({success: true, data: existingUser});
  } else {
    res.status(400).json({error: 'Invalid password'});
  }
});
const server = http.createServer(app);
const io = socket(server);

io.on('connection', socket => {
  socket.on('userOnline', email => {
    userManager.setUserOnline(email, socket.id);
    let user = userManager.getUserByEmail(email);
    socket.email = email; // Storing the email in the socket session for use during disconnect
    io.emit('userStatusChange', {email, status: 'online'});
    // Other necessary actions...
  });

  socket.on('disconnect', () => {
    if (socket.email) {
      // Check if email exists in the socket session
      userManager.setUserOffline(socket.email);
      io.emit('userStatusChange', {email: socket.email, status: 'offline'});
    }
  });

  socket.on('requestToJoin', requestData => {
    const targetUser = userManager.getUserByEmail(requestData.targetEmail);
    if (targetUser.socketConnection) {
      io.to(targetUser.socketConnection).emit('joinRequest', {
        from: requestData.requesterEmail,
      });
    } else {
      console.log(
        'targetUser',
        targetUser,
        'has no attribute socketConnection',
      );
    }
  });

  socket.on('askForOnlineUsers', () => {
    const onlineUsers = userManager.getOnlineUsers();
    socket.emit('onlineUsersList', onlineUsers);
  });

  socket.on('shareFamilyData', data => {
    const targetUser = userManager.getUserByEmail(data.to);
    if (targetUser.socketConnection) {
      socket
        .to(targetUser.socketConnection)
        .emit('receiveFamilyData', data.familyData);
    } else {
      console.log(
        'targetUser',
        targetUser,
        'has no attribute socketConnection',
      );
    }
    // Forward the family data to the client specified by the 'to' property in the received data
  });

  /*
  A listener which informs members of a family to modifications to their family
  */
  socket.on('familyUpdate', data => {
    if (!data || !Array.isArray(data.to)) return;
    console.log(data.to);
    data.to.forEach(user => {
      console.log(user);
      const targetUser = userManager.getUserByEmail(user.user);
      console.log(targetUser);
      if (targetUser && targetUser.socketConnection) {
        console.log('sending to', targetUser);
        io.to(targetUser.socketConnection).emit('familyUpdate', data);
      }
    });
  });
  // Handle errors.
  socket.on('error', errorMessage => {
    userManager.handleError(socket, errorMessage);
  });
});

const PORT = process.env.PORT || 9000;
server.listen(PORT, () =>
  console.log(`Server is up and running on Port ${PORT}`),
);
