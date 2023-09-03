import React from "react";
import {Link} from "react-router-dom";
import Balloons from "./Balloons";

export default function Login(){
	let [inputs, setInputs] = React.useState({username : "", password : ""});
	let [warnings, setWarnings] = React.useState({username : "", password: ""});
	
	function handleSubmit(){
		fetch(`${import.meta.env.VITE_SERVER}/login`,{
			method: 'POST',
			body: JSON.stringify(inputs),
			mode: 'cors',
			headers: {'Content-Type': 'application/json'},
			credentials: 'include'
		})
		.then(res => {
			if(res.status == 409){
				res.json().then(val => {
					let key = Object.keys(val)[0];
					setWarnings(prev => ({...prev, [key]: val[key]}));
				});
			}
			else if(res.status == 200){
				res.json().then(data => {
					window.location.href = "/";
				});
			}
		});
	}

	function handleChange(event){
		setInputs(prev => ({...prev, [event.target.id]: event.target.value}));
		setWarnings(prev => ({...prev, [event.target.id]: ""}));
	}

	return (
		<div className="auth">
			<form>
				<div className="auth__form-bg" />
				<h2 className="auth__heading2">Log in to Socmed</h2>
				<div className="auth__input-container">
					<label className="auth__label" htmlFor="username" >Username</label>
					<input className="auth__input input--style" id="username" name="auth-detail" type="text" value={inputs.username} onChange={handleChange}/>
					<div className="auth__warning" name="login-username">{warnings.username}</div>
				</div>
				<div className="auth__input-container">
					<label className="auth__label" htmlFor="password" >Password</label>
					<input className="auth__input input--style" id="password" name="auth-detail" type="password" value={inputs.password} onChange={handleChange}/>
					<div className="auth__warning" name="login-password">{warnings.password}</div>
				</div>
				<button className="auth__button button--style" type="button" onClick={handleSubmit}>Login</button>
				<h3 className="auth__heading3">{"Don't have an account?"}</h3>
				<button type="button" className="auth__button button--style" onClick={() => window.location.href = "/signup"}>Sign Up</button>
			</form>
			<h1 className="auth__heading1">Socmed.</h1>
		</div>
	)
}
