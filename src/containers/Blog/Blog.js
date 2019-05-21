import React, { Component } from "react";
import { NavLink, Switch, Route, Redirect } from "react-router-dom";
import Rooms from "./Rooms/Rooms";
import RoomRender from "./Rooms/RoomRender";
import Authors from "./Authors/Authors.js";
import Register from "./Register/Register.js";
import Login from "./Login/Login.js";
import Home from "./Home/Home.js";
import Cookies from 'universal-cookie';
import './Blog.css';
import "../../const"

export default class Blog extends Component {
    constructor(props) {
        super(props);
        this.cookies = new Cookies();
        if(this.cookies.get("name") && this.cookies.get("name") !== "")
            this.state = {login:this.cookies.get("name"),login_color:"blue"};
        else
            this.state = {login: "Login", login_color: "black"};
    }
    update(obj){
        // any compnent upcall.
        console.log('upcall');
        if(obj.cookies.get("name") && obj.cookies.get("name") !== ""){
            console.log("change to admin!");
            obj.setState({login:obj.cookies.get("name"),login_color:"blue"});
        }else{
            console.log("change to login!");
            obj.setState({login:"Login",login_color:"black"});
        }
     }
    render() {
        let child_props = {
            cookies : this.cookies,
            update : this.update,
            blog_page : this
        }
        return (
            <div>
                <div className="nav_bar">
                    <div className="nav_btn">
                        <NavLink to="/home" style={{ textDecoration: 'none', color: 'black' }}>Home</NavLink>
                    </div>
                    <div className="nav_btn">
                        <NavLink to="/rooms" style={{ textDecoration: 'none', color: 'black' }}>Room</NavLink>
                    </div>
                    <div className="nav_btn">
                        <NavLink to="/authors" style={{ textDecoration: 'none', color: 'black' }}>~Meow~</NavLink>
                    </div>
                    <div className="nav_btn">
                        <NavLink to="/login" style={{ textDecoration: 'none', color: this.state.login_color }}>{this.state.login}</NavLink>
                    </div>
                    <div className="nav_btn">
                        <NavLink to="/register" style={{ textDecoration: 'none', color: 'black' }}>Register</NavLink>
                    </div>
                </div>
                <hr/>
                <div className="context">
                <Switch>
                    <Route path="/" exact render={(props) => (
                        <Home {...props} {...child_props} />
                    )}/>
                    <Route path="/rooms" exact render={(props) => (
                        <Rooms {...props} {...child_props} />
                    )}/>
                    <Route path="/rooms/:hostName/:roomName" exact render={(props) => (
                        <RoomRender {...props} {...child_props} />
                    )}/>
                    <Route path="/authors" render={(props) => (
                        <Authors {...props} {...child_props} />
                    )}/>
                    <Route path="/register" render={(props) => (
                        <Register {...props} {...child_props} />
                    )}/>
                    <Route path="/login" render={(props) => (
                        <Login {...props} {...child_props} />
                    )}/>
                    <Redirect from="/home" to="/" />
                </Switch>
                </div>
            </div>
        );
    }
}
