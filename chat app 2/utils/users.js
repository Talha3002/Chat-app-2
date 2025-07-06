const users = [];

function userjoin(id, username, room) {
    const user = { id, username, room };

    users.push(user);

    return user;
}

function getCurrentuser(id) {
    return users.find(user => user.id === id);
}

function userLeaves(id) {
    const index = users.findIndex(user => user.id === id);
    if(index!==-1){
        return users.splice(index,1)[0];
    }
}

function getuserRoom(room){
    return users.filter(user => user.room === room)
}
module.exports = {
    userjoin,
    getCurrentuser,
    userLeaves,
    getuserRoom
}