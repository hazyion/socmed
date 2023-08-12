import React from "react";
import { Link } from 'react-router-dom';
import Balloons from "./Balloons";

export default function Signup(){

	let [inputs, setInputs] = React.useState({username : "", password : "", email: "", full_name: ""});
	let [warnings, setWarnings] = React.useState({username : "", password : "", email: "", full_name: ""});
	let [valid, setValid] = React.useState({username : false, password : false, email: false, full_name: false});

	const constraints = {
		username: {
			warning: "Username can only contain alphanumeric characters and should start with an alphabet",
			max: 30,
			min: 3,
			re: /^[a-z]+[a-z0-9_]*$/i,
			display: 'Username'
		},
		password: {
			warning: "Password cannot contain whitespaces",
			max: 50,
			min: 8,
			re: /^[\S]*$/,
			display: 'Password'
		},
		full_name: {
			warning: "Name is invalid",
			max: 100,
			min: 1,
			re: /^[a-z' .,-]*$/i,
			display: 'Name'
		},
		email: {
			warning: "Not a valid email",
			max: 200,
			min: 1,
			re: /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/,
			display: 'Email'
		}
	};

	function handleChange(event){
		let field = [event.target.id];
		setInputs(prev => ({...prev, [field]:event.target.value}));
		setWarnings(prev => {
			return {...prev, [field]: validate(constraints[field], event.target.value, field)}
		});
	}

	function validate(obj, str, field){
		let res = "";
		if(str.length > obj.max){
			setValid(prev => ({...prev, [field]: false}));
			return `${obj.display} cannot be over ${obj.max} characters long`;
		}
		if(str.length < obj.min){
			setValid(prev => ({...prev, [field]: false}));
			return `${obj.display} should be atleast ${obj.min} characters long`;
		}
		if(!obj.re.exec(str)){
			setValid(prev => ({...prev, [field]: false}));
			return obj.warning;
		}
		setValid(prev => ({...prev, [field]: true}));
		return res;
	}

	function handleSubmit(){
		if(!(valid.username && valid.password && valid.email && valid.full_name)){
			return;
		}
		setInputs(prev => ({...prev, full_name: prev.full_name.trim()}));
		fetch(`${import.meta.env.VITE_SERVER}/signup`, {
			method: 'POST',
			body: JSON.stringify(inputs),
			headers: {'Content-Type': 'application/json'},
		})
		.then(res => {
			if(res.status == 409){
				res.json().then(val => {
					let key = Object.keys(val)[0];
					setWarnings(prev => ({...prev, [key]: val[key]}));
				});
			}
			else if(res.status == 200){
				window.location.href = "/socmed/login";
			}
		});
	}

	return(
		<div className="auth">
			<form>
				<div className="auth__input-container">
					<label className="auth__label" htmlFor="full_name" >Full Name</label>
					<input className="auth__input input--style" id="full_name" name="auth-detail" type="text" value={inputs.full_name} onChange={handleChange}/>
				</div>
				<div className="auth__warning" name="signup-full_name">{warnings.full_name}</div>
				<div className="auth__input-container">
					<label className="auth__label" htmlFor="email" >Email</label>
					<input className="auth__input input--style" id="email" name="auth-detail" type="text" value={inputs.email} onChange={handleChange}/>
				</div>
				<div className="auth__warning" name="signup-email">{warnings.email}</div>
				<div className="auth__input-container">
					<label className="auth__label" htmlFor="username" >Username</label>
					<input className="auth__input input--style" id="username" name="auth-detail" type="text" value={inputs.username} onChange={handleChange}/>
				</div>
				<div className="auth__warning" name="signup-username">{warnings.username}</div>
				<div className="auth__input-container">
					<label className="auth__label" htmlFor="password" >Password</label>
					<input className="auth__input input--style" id="password" name="auth-detail" type="password" value={inputs.password} onChange={handleChange}/>
				</div>
				<div className="auth__warning" name="signup-password">{warnings.password}</div>
				<div className="auth__button-box">
					<Link to="/socmed/login" className="auth__redirect">Already signed up? Login</Link>
					<button className="auth__button button--style" type="button" onClick={handleSubmit}>Sign Up</button>
				</div>
			</form>
			<Balloons />
			<div className="auth__title">KUCATU</div>
		</div>
	);
}
