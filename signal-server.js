const express = require('express');
const http = require('http');
const socket = require('socket.io');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); // Require bcrypt for hashing

const app = express();
const SALT_ROUNDS = 10; // Number of salt rounds for bcrypt hashing

app.use(bodyParser.json());

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
  /**
   * Create a new family member from the provided signup data.
   *
   * @param {Object} data - The signup data
   * @returns {FamilyMember} - The new family member
   */
  async createFamilyMemberFromSignup(data) {
    const {firstName, lastName, email, password} = data;
    const name = `${firstName} ${lastName}`;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = {
      email,
      password: hashedPassword,
      socketConnection: null,
      online: false,
    };

    const newMember = {
      id: this.getNextId(),
      name: name,
      birthdate: '', // Placeholder, adjust as required
      deathdate: null,
      user: newUser,
      relationships: {
        partner: [],
        children: [],
        parents: [],
      },
    };

    return newMember;
  }

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

  // Assuming members are added to the root if they start a new family
  addMember(memberData) {
    // If the memberData has no relationships (i.e., parents, partners, children),
    // we assume they're the root of a new family.
    if (
      memberData.relationships.children.length === 0 &&
      memberData.relationships.parents.length === 0 &&
      memberData.relationships.partner.length === 0
    ) {
      this.families[memberData.id] = memberData; // Add as a new root family member
    } else {
      // Logic to place the member in the correct position in an existing family
      // This logic will depend on the details provided in memberData and how your application works.
    }
    // Return the updated data or just the new member data
    return this.families[memberData.id];
  }

  // Function to handle adding a relationship.
  addRelationship(relationshipData) {
    // ... Add the new relationship to the family tree.
    // ... Return the updated data.
  }

  // Function to send error messages.
  handleError(clientSocket, errorMessage) {
    // ... Send error message to the client.
  }

  // Other necessary functions...
}

class UserManager {
  constructor() {
    this.users = {};
  }

  getOnlineUsers() {
    return Object.keys(this.users).filter(email => this.users[email].online);
  }

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

  // Additional methods if required...
}

const familyManager = new FamilyManager();

const userManager = new UserManager();

app.get('/', (req, res) => {
  res.send('hello i am a route');
});

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
  // Handle checking the connection.
  socket.on('handleConnection', memberId => {
    const exists = familyManager.doesMemberExist(memberId);
    if (exists) {
      socket.emit('memberStatus', {
        isAssociated: true,
        receivedMemId: memberId,
      });
      // Additional code to send family data or other actions if needed.
    } else {
      socket.emit('memberStatus', {
        isAssociated: false,
        receivedMemId: memberId,
      });
      // Additional code for new members or other actions.
    }
  });

  // Handling response from the root member regarding the join request.
  socket.on('joinResponse', data => {
    const {accepted, requestingMemberData} = data;

    if (accepted) {
      // If the request is accepted, add the member to the family.
      const newMember = familyManager.addMember(requestingMemberData);

      // Notify the requesting member that they've been accepted.
      if (newMember.user && newMember.user.socketConnection) {
        const newMemberSocket = io.to(newMember.user.socketConnection);
        newMemberSocket.emit('joinResponse', {accepted: true});
      }
    } else {
      // If rejected, notify the requesting member.
      if (
        requestingMemberData.user &&
        requestingMemberData.user.socketConnection
      ) {
        const requestingMemberSocket = io.to(
          requestingMemberData.user.socketConnection,
        );
        requestingMemberSocket.emit('joinResponse', {accepted: false});
      }
    }
  });

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

  //provides the initial data for the individual
  socket.on('initialDataRequest', memberId => {
    socket.emit('initialData', familyManager.getFamilyTreeForMember(memberId));
  });

  // Handle adding a member.
  socket.on('addMember', newMemberData => {
    const updatedData = familyManager.addMember(newMemberData);
    io.emit('dataUpdate', updatedData); // Send the update to all connected clients.
  });

  // Handle editing a member.
  socket.on('editMember', editedMemberData => {
    const updatedData = familyManager.editMember(editedMemberData);
    io.emit('dataUpdate', updatedData); // Send the update to all connected clients.
  });

  // Handle adding a relationship.
  socket.on('addRelationship', relationshipData => {
    const updatedData = familyManager.addRelationship(relationshipData);
    io.emit('dataUpdate', updatedData); // Send the update to all connected clients.
  });

  // Handling direct peer-to-peer interactions (assuming the use of some sort of P2P library or direct Socket.IO emits).
  socket.on('collaborationRequest', targetClientId => {
    io.to(targetClientId).emit('collaborationRequest', socket.id); // Send request from Client 1 to Client 2.
  });

  socket.on('collaborationResponse', data => {
    const {targetClientId, response} = data;
    io.to(targetClientId).emit('collaborationResponse', response); // Send response back to the requesting client.
  });

  socket.on('liveEdit', data => {
    const {targetClientId, deltaChanges} = data;
    io.to(targetClientId).emit('liveEdit', deltaChanges); // Send live edit data directly to another client.
  });

  // Handle errors.
  socket.on('error', errorMessage => {
    familyManager.handleError(socket, errorMessage);
  });
});

const PORT = process.env.PORT || 9000;
server.listen(PORT, () =>
  console.log(`Server is up and running on Port ${PORT}`),
);
