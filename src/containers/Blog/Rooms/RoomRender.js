import React, { Component } from "react";
import "../../../const";
import "../Blog.css"
import { NavLink } from "react-router-dom";
import io from "socket.io-client";
import "./RoomRender.css"
import {server_url} from  "../../../const"
var socket = undefined;

// import { NavLink } from "react-router-dom";

export default class RoomRender extends Component {
    constructor(props) {
        super(props);
        this.cookies = props.cookies;
        this.last_update = (+new Date());
        this._isMounted = false;
        this.userName = this.cookies.get('name');
        if(!this.userName || this.userName === "")
            this.userName = "Guest";
        this.hostName = this.props.match.params.hostName;
        this.roomName = this.props.match.params.roomName;
        this.state = {
            system_message : "Loading",
            users_message : ['boasd : asdas','adsad : sdssda'],
            online_people : [],
            room_exist : false,
        };
        this.canvasRef = React.createRef();
        this.now_mouse_down = false;
        this.last_x = 0;
        this.last_y = 0;
        this.last_update = (+new Date());
        
    }

    componentDidMount() {
        socket = io.connect(server_url);
        socket.emit('room_detail_request',{userName:this.userName,hostName:this.hostName,roomName:this.roomName});
        setTimeout((e)=>{
            setInterval((e)=>{
                if(this.state.room_exist)
                    socket.emit('room_detail_request',{userName:this.userName,hostName:this.hostName,roomName:this.roomName,isUpdate:true});
            },300)
        });

        socket.on('room_detail_response'+this.hostName+'/'+this.roomName,(data) => {
            this.setState({system_message:data['system_message'],users_message:data['users_message']});
            if(data['status'] === "OK")
                this.setState({room_exist:true});
            else
                this.setState({room_exist:false});
            
            if(this.state.room_exist){
                const canvas = this.canvasRef.current;
                const context = canvas.getContext('2d');
                if(data['canvas']){
                    console.log('canvas length' , data['canvas'].length)
                    console.log('systemlog', data['system_message'])
                    if(canvas.width !== 470 || canvas.height !== 290){
                        canvas.width  = 470;
                        canvas.height = 290;
                    }
                    let image = new Image();
                    image.src = data['canvas'];
                    // context.clearRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(image, 0, 0);
                }
                console.log("refresh!");
            }
        });
   
    }
    getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        console.log(rect.left,rect.top,evt.clientX,evt.clientY); 
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };   
      };
      
    canvasMoveEvent(e){
        const canvas = this.canvasRef.current;
        if(canvas.width !== 470 || canvas.height !== 290){
            canvas.width  = 470;
            canvas.height = 290;
        }
        if(this.now_mouse_down){
            const context = canvas.getContext('2d');
            var mousePos = this.getMousePos(canvas, e);
        
            context.beginPath();
            function hashCode(str) {
                return str.split('').reduce((prevHash, currVal) =>
                  (((prevHash << 5) - prevHash) + currVal.charCodeAt(0))|0, 0);
            }
            context.strokeStyle = ["black","red","blue","purple"][hashCode(this.userName)%3];
            context.moveTo(this.last_x, this.last_y);
            context.lineTo(mousePos.x, mousePos.y);  
            context.stroke();
            this.last_x = mousePos.x;
            this.last_y = mousePos.y;

            var dataurl = canvas.toDataURL();
            
            socket.emit('submit_canvas_request',{
                userName:this.userName,
                hostName:this.hostName,
                roomName:this.roomName,
                submitCanvas:dataurl});
        

        }
    }
    canvasDownEvent(e){
        const canvas = this.canvasRef.current;
        var mousePos = this.getMousePos(canvas, e);
        this.last_x = mousePos.x;
        this.last_y = mousePos.y;
        this.now_mouse_down = true;
        console.log('down');
    }
    canvasUpEvent(e){
        this.now_mouse_down = false;
        console.log('up');
    }
    componentWillUnmount() {
        socket.close();
        this._isMounted = false;
        console.log('canvas : ',this.state.canvas);
    }
    handleCvEvent(event){
        console.log(event);
    }
    noroom(){
        return <div>
            <span style={{color:'red'}}> {this.state.system_message} </span>
            <br></br>
            <NavLink 
                    to={"/rooms"} 
                    style={{
                        textDecoration: 'none',
                        color:"black",
                        fontWeight : "bold",  
                    }}
            ><button>Go to select room page</button>
            </NavLink>
        </div>
    }
    submit_message(e){
        if( e.key === "Enter" ){
            let submit_message = this.input_message_field.value;
            if(submit_message === "")
                return;
            console.log("Enter ",submit_message);
            socket.emit('submit_message_request',{
                userName:this.userName,
                hostName:this.hostName,
                roomName:this.roomName,
                submitMessage:submit_message});
            this.input_message_field.value = "";
        }
    }
    hasroom(){
        return <div>
            <h2>{this.roomName}</h2>
            <h6 style={{marginTop:"-20px"}}> Hosted by : {this.hostName} </h6>
            <div className="roomBody">
                <div className="leftRoomBody">
                    building
                </div>
                <div className="rightRoomBody">

                    <div className="canvasSection">
                        <canvas className="aggregatedCanvas"
                        ref={this.canvasRef}
                        onMouseMove={(e)=>this.canvasMoveEvent(e)}
                        onMouseDown={(e)=>this.canvasDownEvent(e)}
                        onMouseUp={(e)=>this.canvasUpEvent(e)}></canvas>
                    </div>

                    <div className="messageSection">
                        <div className="message">
                            {this.state.users_message.map( (data,index)=>(<span key={"message"+index}>{data}<br/></span>))}
                        </div>
                    </div>

                    <div className="inputSection">
                        <input 
                            className="inputMessage" 
                            placeholder="What do you want to talk?"

                            type="text"
                            name="input_message_field" 
                            onKeyPress={(e) => this.submit_message(e)}
                            ref={(input) => { this.input_message_field = input; }} 
                        ></input>
                    </div>
                </div>
            </div>
         </div>
    }
    render() {
        return this.state.room_exist ? this.hasroom() : this.noroom();
    }
}
