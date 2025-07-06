const express = require('express');
const app = express();
const formatMessages = require('./utils/messages');
const formatVMs=require('./utils/vms');
const { userjoin, getCurrentuser, userLeaves, getuserRoom } = require('./utils/users');
const { type } = require('os');
const http = require('http').createServer(app);
const port = 5000;

http.listen(port, () => {
    console.log(`server running on port ${port}`);
})
app.use(express.static(__dirname + '/public'));
let chatbot = 'MyChat';
const io = require('socket.io')(http);

io.on('connection', socket => {
    console.log("New connection....");
    socket.on('joinroom', ({ username, room }) => {
       const user = userjoin(socket.id,username,room);
       socket.join(user.room);
        socket.emit('message', formatMessages(chatbot, 'Welcome'));

        socket.broadcast.to(user.room).emit('message', formatMessages(chatbot, `${user.username} has joined the chat`));

        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getuserRoom(user.room)
        });
    });

    socket.on('chatMessage', msg => {
        const user = getCurrentuser(socket.id);
        io.to(user.room).emit('message', formatMessages(user.username, msg, 'text'));
    });

    socket.on('voiceMessage', (audio) => {
        const user = getCurrentuser(socket.id);
        console.log("Voice message received from", user.username);
        io.to(user.room).emit('voiceMessage', formatVMs(user.username, audio));
    });

    socket.on('disconnect', () => {
        const user = userLeaves(socket.id);
        if(user){
            io.to(user.room).emit('message', formatMessages(chatbot, `${user.username} has left the chat`));


            io.to(user.room).emit('roomUsers',{
                room:user.room,
                users:getuserRoom(user.room)
            });
        }
    });

});