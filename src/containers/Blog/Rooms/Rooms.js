import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import io from "socket.io-client";
import "./Room.css"
const server_url = "http://localhost:8000";
var socket = undefined;
export default class Rooms extends Component {
    
    constructor(props) {
        super(props);
        this.cookies = props.cookies;
        this.last_update = (+new Date());
        
        this._isMounted = false;
        this.hostName = this.cookies.get('name');
        if(!this.hostName || this.hostName === "")
            this.hostName = "Guest";
        this.state = {
            message : "",
            allRoomEntry : []
        };
        
    }
    componentDidMount() {
        this._isMounted = true;
        socket = io.connect(server_url);
        socket.emit('look_room_request');
        socket.on('look_room_response',(data) => {
            this.setState({allRoomEntry:data});
            console.log("refresh!");
        })
    }
    componentWillUnmount() {
        socket.close();
        this._isMounted = false;
    }
    add_room(){
        let room_name = this.new_room_name.value;
        let host_name = this.hostName;
        socket.emit('add_room_request',{room_name: room_name, host_name: host_name});
        socket.on("add_room_response" , data=>{
            this.setState({ message:  data['message'] });            
            this.update_rooms();
    
        });
    }
    delete_room(hostName,roomName){
        console.log("delete" , hostName, roomName);
        socket.emit('delete_room_request',{room_name: roomName, host_name: hostName});
        this.update_rooms();
    }
    add_room_input( e ){
        if( e.key === "Enter" ){
            this.add_room(e);
        }
    }
    update_rooms(){
        if( (+new Date()) - this.last_update > 1000){
            socket.emit('look_room_request');
            this.last_update =  (+new Date());

        }
    }
    get_single_room(title,hint,host,index){
        return  <div className = "room_entry" key={index}>
                    <div style={{height:"30px", marginTop:"5px"}}>
                        {title}
                    </div>
                    <div style={{height:"10px", fontSize:"8px"}}>
                        <div >
                            {hint}
                        </div>
                        <div style={{marginRight:"10px", float:"right"}}>
                            {host}             
                        </div>
                    </div>
                </div>
    }
    get_rooms(){
        this.update_rooms();
        const lists = this.state.allRoomEntry.map((data) => (
            <NavLink 
                    to={"/rooms/" + data['hostName'] +'/' +data['roomName']} 
                    style={{
                        textDecoration: 'none',
                        color:"black",
                        fontWeight : "bold",  
                        position: "relative",
                        zIndex: 0  
                    }}
                >
            {this.get_single_room(
                <span> {data['roomName']} </span> , 
                data['hostName'] === this.hostName || "admin" === this.hostName ?
                <span className="delete_btn"  style={{ float:"left", marginLeft:"10px", position:"relative" , zIndex:1}} 
                    onClick={(e) => this.delete_room(data['hostName'],data['roomName'])}> Delete</span>: <span></span>,
                <span> Host: {data['hostName']} </span>,
                data['_id']
            )}
            </NavLink>
        ));
        return lists
    }
    render() {
        // Original Rooms
        const lists = this.get_rooms();
        // Add Rooms Option
        lists.push(this.get_single_room(
            
            <input 
                type="text"
                name="name_input" 
                onKeyPress={(e) => this.add_room_input(e)}
                ref={(input) => { this.new_room_name = input; }} 
            ></input>,
            
            <button style={{
                    fontWeight:"bold", 
                    fontSize:"7px", 
                    width:"200px", 
                    marginTop:"-2px"}} 
                onClick={(e)=>this.add_room()} 
            >Click here to create your own room!</button>,
            <noscript></noscript>,-1
        ))
        // Arrange to 2*n table
        const table_obj = []
        for(let i=0 ; i < lists.length-1 ; i+=2 ){
            table_obj.push([lists[i],lists[i+1],'tr' + i ]);
        }
        
        if( lists.length & 1 ){
            table_obj.push(
                [lists[lists.length-1],
                <div style={{width: "300px", height: "50px" , margin: "0px", borderWidth: "2px", borderStyle:""}}> </div>,
                'tr' + (-1)
            ]);
        }
        const table = table_obj.map( (row)=>(
            <tr key={row[2]}>
                <td> {row[0]}</td>
                <td> {row[1]}</td>
            </tr>
        ))
        return (
            <div>
                <h2 style={{ color  : "black"}}> Choose a room to start chatting!</h2>
                <div style={{color:'red', fontSize:'10px'}}>
                    {this.state.message}
                </div>
                <table style={{ margin: "auto" }}>
                    <tbody>
                        {table}
                    </tbody>
                </table>
            </div>
        );
    }
}
