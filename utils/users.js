const users = []; 

function userJoin(id, username, room) {
    const newUser = { id, username, room }; 

    users.push(newUser); 

    return newUser; 
}

function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

//user leaves chat 
function userLeave(id){
    const index = users.findIndex(user => user.id === id);

    if(index !== -1){
        return users.splice(index,1)[0];
    }
}

//get room user
function getRoomUser(room){
    return users.filter(user => user.room === room);
}


module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUser
};
