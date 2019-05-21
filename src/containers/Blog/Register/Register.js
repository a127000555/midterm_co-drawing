import React, { Component } from "react";
import io from "socket.io-client";
import {server_url} from  "../../../const"


export default class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message : ""
        };
      }
    input_name(e){
        this.name = e.target.value;
        if( e.key === "Enter" ){
            this.now_focus = this.pass_input;
            this.componentDidMount();
        }
    }
    input_pass(e){
        this.pass = e.target.value;
        if( e.key === "Enter" ){
            this.now_focus = this.submit_btn;
            this.componentDidMount();
            this.register(e);
        }
    }
    register(e) {
        this.name = this.name_input.value;
        this.pass = this.pass_input.value;
        const socket = io.connect(server_url);
        console.log("Registered :" , this.name , ":" , this.pass);
        socket.emit('register_request',{name: this.name, pass: this.pass});
        socket.on("register_response",data=>{
            console.log('response',data);
            this.setState({ message:  data['message'] });

        })
    }
    componentDidMount(){
        this.now_focus.focus(); 
     }
    render() {
        this.name = "";
        this.pass = "";
        return (
            <div>
                <h1>Register Your Account!</h1>
                <h2>Your name:</h2>
                <input 
                    type="text"
                    name="name_input" 
                    onKeyPress={(e) => this.input_name(e)}
                    ref={(input) => { this.now_focus = input; this.name_input = input; }} 
                ></input>
                <h2>Password:</h2>
                <input
                    type="password" 
                    name="password_input"
                    onKeyPress={(e) => this.input_pass(e)}
                    ref={(input) => { this.pass_input = input; }} 
                ></input>
                <br></br>
                <div style={{color:'red', fontSize:'10px'}}>
                    {this.state.message}
                </div>
                <br></br>
                <button 
                    onClick={(e) => this.register(e)}
                    ref={(input) => { this.submit_btn = input; }} 
                >register</button>
            </div>
        );
    }
}
