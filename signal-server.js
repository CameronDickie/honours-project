const express = require('express');
const http = require('http');
const socket = require('socket.io');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); // Require bcrypt for hashing

const app = express();
const SALT_ROUNDS = 10; // Number of salt rounds for bcrypt hashing

app.use(bodyParser.json());
//NO LONGER USED BUT MAY BE REFERRED TO
class FamilyManager {
  constructor() {
    this.families = {};
    this.staticId = 0;
    // other necessary instance variables...
  }
  getNextId() {
    this.staticId += 1;
    return this.staticId;
  }

  /*
    Old methods that may need to be referred back to at a later time (for client side stuff)
  */
  // Recursively check if a member with the given ID exists in a family tree.
  memberExistsInTree(memberId, tree) {
    if (tree.id === memberId) {
      return true;
    }

    for (let childId of tree.relationships.children) {
      if (this.memberExistsInTree(memberId, this.families[childId])) {
        return true;
      }
    }

    for (let partner of tree.relationships.partner) {
      if (this.memberExistsInTree(memberId, this.families[partner.id])) {
        return true;
      }
    }

    // The parents check isn't strictly needed if we are sure that the tree covers all members from the root,
    // but added for completeness.
    for (let parentId of tree.relationships.parents) {
      if (this.memberExistsInTree(memberId, this.families[parentId])) {
        return true;
      }
    }

    return false;
  }

  // Check if a member with the given ID exists.
  doesMemberExist(memberId) {
    for (let familyRootId in this.families) {
      if (this.memberExistsInTree(memberId, this.families[familyRootId])) {
        return true;
      }
    }

    return false;
  }

  getFamilyTreeForMember(memberId) {
    for (let familyRootId in this.families) {
      if (this.memberExistsInTree(memberId, this.families[familyRootId])) {
        return this.families[familyRootId];
      }
    }
    return null;
  }

  findMemberByEmail(email, tree) {
    if (tree.user && tree.user.email === email) {
      return tree;
    }

    for (let child of tree.relationships.children) {
      const foundMember = this.findMemberByEmail(email, child);
      if (foundMember) return foundMember;
    }

    for (let partner of tree.relationships.partner) {
      const foundMember = this.findMemberByEmail(
        email,
        this.families[partner.id],
      );
      if (foundMember) return foundMember;
    }

    return null;
  }
}

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
      console.log(data);
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

  // Handle errors.
  socket.on('error', errorMessage => {
    userManager.handleError(socket, errorMessage);
  });
});

const PORT = process.env.PORT || 9000;
server.listen(PORT, () =>
  console.log(`Server is up and running on Port ${PORT}`),
);
