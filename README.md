Before attempting to run this applciation, please ensure that you have at least one iOS or android emulator installed somewhere on your system.

To start the application, first do ```npm install``` to get all of the node modules

Then, once completed, create two shell sessions. The first, you can simply run npm start. The second, will be to start the signalling server. To do this, you can simply run ```node signal-server.js```

Then, once both are running, inside the terminal you ran npm start in, you can either press 'a' to start the android emulator on your system, or 'i' for the iOS simulator. Alternatively, if you have npx on your path you can run
```npx react-native run-ios``` or ```npx react-native run-android```

Once this builds the application, you should be good to run the application in the emulator and test away.