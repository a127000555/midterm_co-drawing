const mongoose = require('mongoose');

var socket_io = require('socket.io');
var io = socket_io.listen(8787);
mongoose.connect("mongodb+srv://arvin:a127000555@cluster0-kzyxa.gcp.mongodb.net/test?retryWrites=true", {
    useNewUrlParser: true
});
handleError = console.log;
// Initialization : UserSchema
var UserSchema = new mongoose.Schema({
    name : String,
    pass : String,
});
var User = mongoose.model('User', UserSchema);
// Initialization : Room Entry
var RoomEntrySchema = new mongoose.Schema({
    roomName : String,
    hostName : String,
});
var RoomEntry = mongoose.model('RoomEntry', RoomEntrySchema);
// Initialization : Room
var RoomSchema = new mongoose.Schema({
    roomName : String,
    hostName : String,
    message : Array,
    online : Array,
    canvas : String
});
var Room = mongoose.model('Room', RoomSchema);

// Database Connection
db = mongoose.connection
db.on('error', error => {
    console.log(error)
});
db.once('open', () => {
    console.log('MongoDB connected!')
});
var last_broadcast_time = (+new Date());
User.findById
io.sockets.on('connection', function(socket){
    // Handling Register
    socket.on('register_request', function(data){
        User.findOne({name:data['name']}, function(err,user){
            if(err){
                console.log(err);
            }
            if(!user){
                console.log('\r[>] register event: ' , data['name'] , ' successed.');
                var user = new User({
                    name: data['name'],
                    pass: data['pass']
                });
                user.save(function (err) {
                    if (err) return handleError(err);
                });     
                socket.emit('register_response',{status: "OK", message: "Register successfully."});

            }else{
                console.log('\r[>] register event: ' , data['name'] , ' duplicated register.');
                socket.emit('register_response',{status: "NO", message: "This username is already taken."});

            }
            
        });
        return "A";
    });
    // Handling Login
    socket.on('login_request',function(data){
        User.findOne({name:data['name']}, function(err,user){
            if(err){
                console.log(err);
            }if(!user){
                console.log('\r[>] login event: ' , data['name'] , ' username or password invalid.');
                socket.emit('login_response',{status: "NO", message: "username or password invalid"});
            }else if(user.pass != data['pass']){
                console.log('\r[>] login event: ' , data['name'] , ' username or password invalid');
                socket.emit('login_response',{status: "NO", message: "username or password invalid"});
            }else{
                console.log('\r[>] login event: ' , data['name'] , ' successed.');
                socket.emit('login_response',{status: "OK", message: "Login successfully."});
            }
        });
    });
    // Handling Room Entry - Look
    // Broadcast when server start

    function broadcast_room_entry(){
        if( (+new Date()) - last_broadcast_time > 3000){
            RoomEntry.find({}, function(err,data){
                if(err)
                    console.log(err);
                socket.broadcast.emit('look_room_response',data);
                process.stdout.write('*');
            });
            last_broadcast_time = (+new Date());    
        }
    }
    setInterval(broadcast_room_entry,3000);
    socket.on('look_room_request',function(data){
        RoomEntry.find({}, function(err,data){
            if(err)
                console.log(err);
            socket.emit('look_room_response',data);
            console.log('\r[*] high priority look room request');
        });
    });
    // Handling Room Entry - Add
    socket.on('add_room_request',function(data){
        let roomName = data['room_name'];
        let hostName = data['host_name'];
        let create_json = { roomName: roomName, hostName: hostName}
        RoomEntry.findOne(create_json,function(err,roomEntry){
            if(roomEntry){
                // Duplicated room
                socket.emit('add_room_response',{status: "NO", message: "You already set this room name."});
                console.log('\r[>] add room event: user' , hostName , 'duplicated room name');

            }else{
                // New room
                var roomEntry = new RoomEntry(create_json);
                roomEntry.save(function (err) {
                    if (err) return handleError(err);
                    broadcast_room_entry();
                });     
                var room = new Room({
                    roomName:roomName,
                    hostName:hostName,
                    message: [],
                    online: []
                });
                room.save(function (err) {
                    if (err) return handleError(err);
                    broadcast_room_entry();
                });     
                socket.emit('add_room_response',{status: "OK", message: "Add room successfully!"});
                console.log('\r[>] add room event: ' , hostName , ' create room: ' , roomName);
                // setTimeout(broadcast_room_entry,1000);
            }
        })
    });
    // Handling Room Entry - Delete
    socket.on('delete_room_request',function(data){
        let roomName = data['room_name'];
        let hostName = data['host_name'];
        let create_json = { roomName: roomName, hostName: hostName}
        RoomEntry.findOne(create_json,function(err,roomEntry){
            if(roomEntry){
                roomEntry.remove(function(err){
                    if (err) return handleError(err);
                    broadcast_room_entry();
                });
                console.log('\r[x] delete room event: user' , hostName , 'No');
                // setTimeout(broadcast_room_entry,1000);
            }
        })
        Room.findOne(create_json,function(err,room){
            if(room){
                room.remove(function(err){
                    if (err) return handleError(err);
                    broadcast_room_entry();
                });
                console.log('\r[x] delete room details: user' , hostName , 'No');
            }
        })
    });
    // Handling Room Detail Request
    socket.on('room_detail_request',function(data){
        let roomName = data['roomName'];
        let hostName = data['hostName'];
        let userName = data['userName'];
        let isUpdate = data['isUpdate'];
        let query_json = { roomName: roomName, hostName: hostName}
        Room.findOne(query_json,function(err,room){
            let channel = 'room_detail_response'+hostName+'/'+roomName;
            if(room){
                // find
                if(isUpdate)
                    socket.emit(channel,{status: "OK", system_message: "Enter successfuly.",users_message : room['message'],canvas:room['canvas']});
                else
                    socket.emit(channel,{status: "OK", system_message: "",users_message : room['message']});
                console.log('\r[>] enter room response: user' , userName , '>' , hostName+'/'+roomName, "successed.");
            }else{
                socket.emit(channel,{status: "NO", system_message: "The room has been deleted.",users_message:[] });
                console.log('\r[>] enter room response: user' , userName , '>' , hostName+'/'+roomName , "failed.");
            }
        })
    });
    // Submit a message
    socket.on('submit_message_request',function(data){
        let roomName = data['roomName'];
        let hostName = data['hostName'];
        let userName = data['userName'];
        let submitMessage = data['submitMessage'];
        let query_json = { roomName: roomName, hostName: hostName}
        Room.findOne(query_json,function(err,room){
            let channel = 'room_detail_response'+hostName+'/'+roomName;
            if(room){
                // find
                let all_message = room['message'];
                all_message.push(userName + " : " + submitMessage);
                room['message'] = all_message;
                console.log(all_message);
                Room.updateOne(query_json,room,function(err){
                    if (err) return handleError(err);
                });
                // socket.broadcast.emit(channel,{status: "OK", system_message: "Updated-boardcast",users_message : room['message'],canvas:room['canvas']});
                console.log('\r[>] ' , userName , ' : ' , submitMessage , " (successed)");
            }else{
                // socket.emit(channel,{status: "NO", system_message: "The room has been deleted."});
                console.log('\r[>] ' , userName , ' : ' , submitMessage , " (failed)");
            }
        })
    });
    // Submit canvas
    socket.on('submit_canvas_request',function(data){
        let roomName = data['roomName'];
        let hostName = data['hostName'];
        let userName = data['userName'];
        let canvas = data['submitCanvas'];
        console.log('canvas',canvas.length);
        let query_json = { roomName: roomName, hostName: hostName}
        Room.findOne(query_json,function(err,room){
            let channel = 'room_detail_response'+hostName+'/'+roomName;
            if(room){
                // find
                room['canvas'] = canvas;
                Room.updateOne(query_json,room,function(err){
                    if (err) return handleError(err);

                });
                console.log('channel')
                // socket.emit(channel,{status: "OK", system_message: "Updated",users_message : room['message'],canvas:room['canvas']});
                console.log('\r[>] ' , userName , " update canvas (successed)");
            }else{
                // socket.emit(channel,{status: "NO", system_message: "The room has been deleted."});
                console.log('\r[>] ' , userName , " update canvas (failed)");
            }
        })
    });
});