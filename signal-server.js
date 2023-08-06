const express = require('express');
const http = require('http');
const socket = require('socket.io');
const bodyParser = require('body-parser');

const app = express();

// Allow the server to parse JSON requests
app.use(bodyParser.json());
const families = {};

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
  createFamilyMemberFromSignup(data) {
    const {firstName, lastName} = data;
    const name = `${firstName} ${lastName}`;

    const newMember = {
      id: this.getNextId(),
      name: name,
      birthdate: '', // Placeholder, adjust as required
      deathdate: null,
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

  // Fetch the family tree for a particular member.
  getFamilyTreeForMember(memberId) {
    for (let familyRootId in this.families) {
      if (this.memberExistsInTree(memberId, this.families[familyRootId])) {
        return this.families[familyRootId];
      }
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
    return this.families;
  }

  // Function to handle editing a member.
  editMember(memberData) {
    // ... Edit the member details in the family tree.
    // ... Return the updated data.
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

const familyManager = new FamilyManager();

app.get('/', (req, res) => {
  res.send('hello i am a route');
});

let currentMemId = 0; // Start from 0, but you can start from any other value if desired.

app.get('/getMemId', (req, res) => {
  currentMemId += 1; // Increment the ID
  res.json({memId: currentMemId});
});

app.post('/signup', (req, res) => {
  const data = req.body;
  let familyId = data.familyId;
  // Validate input data (newMember structure, familyId, etc.)
  // For simplicity, I'm skipping this step, but it's crucial in a real application.

  //fix newMember in this context but for now it just works with creating a new user
  if (familyId) {
    // Joining an existing family
    // Check if family with familyId exists
    if (familyManager.doesMemberExist(familyId)) {
      // Add new member to the family
      const updatedData = familyManager.addMember(newMember);
      res.json({status: 'joined', data: updatedData});
    } else {
      res.status(400).json({error: 'Invalid familyId provided.'});
    }
  } else {
    const newMember = familyManager.createFamilyMemberFromSignup(data);
    // Creating a new family
    const updatedData = familyManager.addMember(newMember);
    // Ideally, you might want some logic inside the `addMember` function
    // to handle root family members differently (i.e., those who are starting a new family).
    res.json({status: 'created', data: updatedData, message: 'created', success: true});
  }
});

const server = http.createServer(app);
const io = socket(server);

io.on('connection', socket => {
  // Handle checking the connection.
  socket.on('handleConnection', memberId => {
    const exists = familyManager.doesMemberExist(memberId);
    if (exists) {
      socket.emit('memberStatus', true);
      // Additional code to send family data or other actions if needed.
    } else {
      socket.emit('memberStatus', false);
      // Additional code for new members or other actions.
    }
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

server.listen(9000, () => console.log('Server is up and running on Port 9000'));
