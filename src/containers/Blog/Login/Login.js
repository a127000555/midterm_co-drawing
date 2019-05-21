import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import io from "socket.io-client";
// import { readdir } from "fs";
const server_url = "http://localhost:8000";

export default class Login extends Component {
    
    constructor(props) {
        super(props);
        this.cookies = props.cookies;
        this.state = {
            message : ""
        };
      }
    
    input_name(e){
        if( e.key === "Enter" ){
            this.now_focus = this.pass_input;
            this.componentDidMount();
        }
    }
    input_pass(e){
        if( e.key === "Enter" ){
            this.now_focus = this.submit_btn;
            this.componentDidMount();
            this.login(e);
        }
    }
    login(e) {
        this.name = this.name_input.value;
        this.pass = this.pass_input.value;
        let name = this.name_input.value;
        console.log("logined :[" , this.name , "]:[" , this.pass ,']');
        const socket = io.connect(server_url);
        socket.emit('login_request',{name: this.name, pass: this.pass});
        socket.on("login_response" , data=>{
            this.setState({ message:  data['message'] });
            if( data['status']==="OK" ){
                this.cookies.set("name", name, {path: "/"}, {
                    expires: 3600
                 });
                this.props.update(this.props.blog_page);
                window.location.replace('/');
            }
            
        });
     
    }
    logout(e) {
        this.now_focus = e.target;
        this.cookies.set("name","");
        this.setState({ message:  "" });
        this.props.update(this.props.blog_page);
    }
    componentDidMount(){
        this.now_focus.focus(); 
    }
    render_login() {
        this.name = "";
        this.pass = "";
        return (
            <div>   
                <h1>Login page</h1>
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
                    onClick={(e) => this.login(e)}
                    ref={(input) => { this.submit_btn = input; }} 
                >login</button>
            </div>
        );
    }
    render_logout() {
        this.now_focus = undefined;
        return (
            <div>   
                <h1>User page</h1>
                <h2>Hi, {this.cookies.get("name")}!</h2>
                <button 
                    onClick={(e) => this.logout(e)}
                    ref={(input) => { this.submit_btn = input; this.now_focus = input; }} 
                    style={{width:"80px"}}
                >logout</button>
                <br></br>
                <button style={{width:"80px"}}>
                    <NavLink to="/" style={{ textDecoration: "none", color: "black" }}>
                        Home
                    </NavLink>
                </button>
                    
            </div>
        );
    }
    render(){
        if(this.cookies.get('name'))
            return this.render_logout();
        else
            return this.render_login();

    }
}
