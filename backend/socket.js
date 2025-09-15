let io;

//we export an object with two methods: init and getIO which will be used to initialize and get the io instance respectively
//init will be called in app.js after the server is created and getIO will be used in the controllers to emit events to the connected clients
module.exports = {
    init: httpServer => {
        io = require('socket.io')(httpServer, {
            cors: {
                origin: "http://localhost:3000",
                methods: ["GET", "POST"]
            }
        });
        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    }
};