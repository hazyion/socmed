import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons';
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { nanoid } from 'nanoid';

export default function CreateCommunity(){

	let [inputs, setInputs] = React.useState({name: "", description: "", banner: "", admin: Array()});
	let [valid, setValid] = React.useState({name: false, description: true, banner: false, admin: false})
	let [warnings, setWarnings] = React.useState({name: "", description: "", banner: "", admin: ""});
	let [banner, setBanner] = React.useState(null);
	let [admin, setAdmin] = React.useState("");
	let fileTypes = ['image/jpeg', 'image/gif', 'image/png', 'image/webp'];
	let constraints = {
		name: {
			re: /^[a-z0-9]+[a-z0-9\s]*$/i,
			warning: "Name can only have letters, numbers, spaces and cannot start with a space",
			display: "Name",
			min: 1,
			max: 30
		},
		description: {
			re: /^[^\t\n]*$/,
			warning: "",
			display: "Description",
			min: 0,
			max: 150
		},
		admin: {
			re: /^[a-z]+[a-z0-9_]*$/i,
			warning: "This username is invalid",
			display: "Username",
			min: 3,
			max: 30
		}
	};
	let uploadElement = React.useRef(null);
	const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
	const firebase = getStorage(initializeApp(firebaseConfig));
	const storageRef = ref(firebase);
	const bannerRef = ref(storageRef, 'banner');

	function handleClickUpload(){
		uploadElement.current.files = null;
		uploadElement.current.click();
	}

	function handleFiles(){
		let file = uploadElement.current.files[0];
		let id = "b_" + nanoid();
		file.id = id;
		let obj = {warning: "", valid: true, banner: file, id};
		if(!fileTypes.some(val => file.type === val)){
			obj.warning = "File must be of a valid image type";
			obj.valid = false;
			obj.banner = null;
			obj.id = "";
		}
		setInputs(prev => ({...prev, banner: obj.id}));
		setBanner(obj.banner);
		setValid(prev => ({...prev, banner: obj.valid}));
		setWarnings(prev => ({...prev, banner: obj.warning}));
	}

	function handleClickDelete(user){
		let arr = [...inputs.admin];
		arr = arr.filter((val) => val !== user);
		setInputs(prev => {
			return {...prev, admin: arr};
		});
	}

	function handleClickAdd(event){
		if(!valid.admin)
			return;
		if(inputs.admin.find(x => x === admin)){
			setWarnings(prev => ({...prev, admin: "User has already been added"}));
			return;
		}
		fetch(`https://socmed-server.vercel.app/api/profile?user=${admin}`, {
			method: 'GET',
			headers: {'Content-Type': 'application/json'}
		})
		.then(res => {
			if(res.status == 409){
				setWarnings(prev => ({...prev, admin: "This user does not exist"}));
				return;
			}
			else if(res.status == 200){
				setInputs(prev => ({...prev, admin: [...prev.admin, admin]}));
				setAdmin("");
			}
		});
	}

	function handleChange(event){
		let field = event.target.id;
		let set = true;
		if(field == 'description'){
			if(!constraints[field].re.exec(event.target.value))
				return;
		}
		else{
			if(!constraints[field].re.exec(event.target.value)){
				setWarnings(prev => ({...prev, [field]: constraints[field].warning}));
				setValid(prev => ({...prev, [field]: false}));
				set = false;
			}
		}
		if(event.target.value.length > constraints[field].max){
			setWarnings(prev => ({...prev, [field]: `${constraints[field].display} cannot be longer than ${constraints[field].max} characters long`}));
			setValid(prev => ({...prev, [field]: false}));
			set = false;
		}
		else if(event.target.value.length < constraints[field].min){
			setWarnings(prev => ({...prev, [field]: `${constraints[field].display} cannot be shorter than ${constraints[field].min} character(s) long`}));
			setValid(prev => ({...prev, [field]: false}));
			set = false;
		}
		setInputs(prev => ({...prev, [field]: event.target.value}));
		if(set){
			setValid(prev => ({...prev, [field]: true}));
			setWarnings(prev => ({...prev, [field]: ""}));
		}
	}

	function handleChangeAdmin(event){
		if(!constraints.admin.re.exec(event.target.value)){
			setWarnings(prev => ({...prev, admin: constraints.admin.warning}));
			setValid(prev => ({...prev, admin: false}));
		}
		else if(event.target.value.length > constraints.admin.max){
			setWarnings(prev => ({...prev, admin: `Username cannot be greater than ${constraints.admin.max} characters long`}));
			setValid(prev => ({...prev, admin: false}));
		}
		else if(event.target.value < constraints.admin.min){
			setWarnings(prev => ({...prev, admin: `Username cannot be shorter than ${constraints.admin.min} character(s) long`}));
			setValid(prev => ({...prev, admin: false}));
		}
		else{
			setWarnings(prev => ({...prev, admin: ""}));
			setValid(prev => ({...prev, admin: true}));
		}
		setAdmin(event.target.value);
	}

	function handleClickCreate(){
		if(!valid.name || !valid.description || !valid.banner){
			if(banner == null){
				setWarnings(prev => ({...prev, banner: "Please select a valid banner"}));
			}
			if(inputs.name === ""){
				setWarnings(prev => ({...prev, name: "Please enter a valid name"}));
			}
			return;
		}
		(async() => {
			let res = await fetch(`https://socmed-server.vercel.app/api/community/create`, {
				method: 'POST',
				body: JSON.stringify(inputs),
				headers: {'Content-Type': 'application/json'}
			});
			if(res.status == 409){
				let data = res.json();
				setWarnings(prev => ({...prev, ...data.warnings}));
				setValid(prev => ({...prev, ...data.valid}));
			}
			else if(res.status == 200){
				let fileRef = ref(bannerRef, inputs.banner);
				await uploadBytes(fileRef, banner);
				window.location.href = "/socmed/";
			}
		})();
	}

	return (
		<div className="community-create">
			<div className="community-create__header">Create your own community</div>
			<div className="community-create__form">
				<div className="community-create__label">Name your community</div>
				<input type="text" className="community-create__input  input--style" id="name" value={inputs.name} onChange={handleChange}/>
				<div className="community-create__warning" type="input">{warnings.name}</div>
			
				<div className="community-create__label">Add a description</div>
				<textarea className="community-create__input  input--style" id="description" value={inputs.description} onChange={handleChange}></textarea>
				<div className="community-create__warning" type="description">{warnings.description}</div>

				<div className="community-create__label">Upload a banner</div>
				<div className="community-create__upload-box">
					<button type="button" className="community-create__upload-button button--style" onClick={handleClickUpload}>Browse</button>
					<input type="file" ref={uploadElement} onChange={handleFiles}/>
					<div className="community-create__banner">{banner == null ? "No file selected" : banner.name}</div>
				</div>
				<div className="community-create__warning" type="description">{warnings.banner}</div>

				<div className="community-create__label">Add administrators</div>
				<div className="community-create__admin-box">
					<input type="text" id="admin" className="community-create__input  input--style" value={admin} onChange={handleChangeAdmin}/>
					<button className="community-create__add-button button--style" type="button" onClick={handleClickAdd}>+</button>
					{inputs.admin.map(user => <div key={user} className="community-create__admin">{user}<span className="community-create__delete-admin" onClick={() => handleClickDelete(user)}>x</span></div>)}
				</div>
				<div className="community-create__warning" type="description">{warnings.admin}</div>
				<button className="community-create__submit-button button--style" onClick={handleClickCreate}>Create</button>
			</div>
		</div>
	);
}