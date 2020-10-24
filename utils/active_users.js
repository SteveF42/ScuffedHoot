const active_users = []

function create_user_object(_id,name=null,game_room=null,in_game=false){
    let obj = {
        "id" : _id,
        "name" : name,
        "game_room" : game_room,
        "currently_ingame" : in_game
    }
    return obj;
}

function find_id(_id){
    for(obj in active_users){
        if(obj.id === _id){
            return true;
        }
    }
    return false;
}

function add_user(_id,name = null,game_room = null,in_game = false){
    user_obj = create_user_object(_id,name,game_room,in_game)
    active_users.push(user_obj)
}

function update_user(id,name=null,game_room=null,in_game=null){
    for(obj in active_users){
        if(obj.id === id){
            if(name != null){
                obj.name = name
            }
            if(game_room != null){
                obj.game_room = game_room
            }
            if(in_game != null){
                obj.in_game = in_game
            }
        }
    }
}

function remove_user(_id){
    let index = null
    active_users.find((obj,i)=>{
        if(obj.id === _id){
            index = i
            return true;
        }
    })
    delete active_users[i]
}

module.exports = {add_user, find_id, update_user, remove_user}