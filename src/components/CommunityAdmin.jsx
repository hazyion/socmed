import React from "react";
import { nanoid } from "nanoid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";
import '../styles/communityAdmin.css';

export default function CommunityAdmin(props){
	let [adminPanel, setAdminPanel] = React.useState({
		post: false,
		kickMember: false,
		removeAdmin: false,
		addAdmin: false,
		banner: false
	});
	let [inputs, setInputs] = React.useState({
		postInput: "",
		postDescription: "",
		postMedia: null,
		kickMember: "",
		removeAdmin: "",
		addAdmin: "",
		banner: null
	});
	let [warnings, setWarnings] = React.useState({
		postInput: "",
		postDescription: "",
		postMedia: "",
		kickMember: "",
		removeAdmin: "",
		addAdmin: ""
	});
	let userExp = /^[a-z]+[a-z0-9_]*$/i;
	let uploadElementPost = React.useRef(null), uploadElementBanner = React.useRef(null);
	const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
	const firebase = getStorage(initializeApp(firebaseConfig));
	const storageRef = ref(firebase);
	const homeRef = ref(storageRef, 'home');
	const bannerRef = ref(storageRef, 'banner');
	let imageTypes = ['image/jpeg', 'image/gif', 'image/png', 'image/webp'];
	let mediaTypes = ['image/jpeg', 'image/gif', 'image/png', 'image/webp', 'video/ogg', 'video/mp4', 'video/webm'];

	function handleClickUpload(arg){
		if(arg == 'banner'){
			uploadElementBanner.current.files = null;
			uploadElementBanner.current.click();
		}
		else{
			uploadElementPost.current.files = null;
			uploadElementPost.current.click();
		}
	}

	function handleClickAdminPanel(panel){
		setAdminPanel(prev => {
			let obj = {};
			for(let i of Object.keys(prev)){
				obj[i] = false;
			}
			obj[panel] = !prev[panel];
			return obj;
		});
	}

	function handleChange(event){
		let field = event.target.id;
		setInputs(prev => ({...prev, [field]: event.target.value}));
		if(field == 'addAdmin' || field == 'removeAdmin' || field == 'kickMember'){
			if(userExp.exec(event.target.field) == null || event.target.value.length < 3 || event.target.value.length > 30){
				setWarnings(prev => ({...prev, [field]: "Username is invalid"}));
			}
			else{
				setWarnings(prev => ({...prev, [field]: ""}));
			}
		}
		else if(field == 'postDescription'){
			if(event.target.value.length > 250){
				setWarnings(prev => ({...prev, postDescription: "Description cannot be longer than 250 characters"}));
			}
			else{
				setWarnings(prev => ({...prev, postDescription: ""}));
			}
		}
	}

	function handleFiles(arg){
		if(arg == 'banner'){
			let file = uploadElementBanner.current.files[0];
			let id = "b_" + nanoid();
			file.id = id;
			if(!imageTypes.some(val => file.type === val)){
				setWarnings(prev => ({...prev, banner:"File must be of a valid image type"}));
				setInputs(prev => ({...prev, banner: null}));
			}
			else{
				setInputs(prev => ({...prev, banner: file}));
				setWarnings(prev => ({...prev, banner: ""}));
			}
		}
		else{
			let file = uploadElementPost.current.files[0];
			let id = "h_" + nanoid();
			file.id = id;
			if(!mediaTypes.some(val => file.type === val)){
				setWarnings(prev => ({...prev, postMedia:"File must be a valid image or video"}));
				setInputs(prev => ({...prev, postMedia: null}));
			}
			else if(file.size >= 300000 && file.type.substr(0, 5) === "image"){
				setWarnings(prev => ({...prev, postMedia:"Images cannot be larger than 300 kB"}));
				setInputs(prev => ({...prev, postMedia: null}));
			}
			else if(file.size >= 10000000){
				setWarnings(prev => ({...prev, postMedia:"Videos cannot be larger than 10 MB"}));
				setInputs(prev => ({...prev, postMedia: null}));
			}
			else{
				setWarnings(prev => ({...prev, postMedia: ""}));
				setInputs(prev => ({...prev, postMedia: file}));
			}
		}
	}

	async function isValid(arg){
		if(arg == 'post'){
			if(inputs.postDescription.length > 250){
				setWarnings(prev => ({...prev, postDescription: "Description cannot be longer than 250 characters"}));
			}
			else if(inputs.postMedia == null){
				setWarnings(prev => ({...prev, postMedia: "Please include a valid image or video"}));
			}
			else{
				return true;
			}
			return false;
		}
		else if(arg == 'addAdmin' || arg == 'removeAdmin' || arg == 'kickMember'){
			if(userExp.exec(inputs[arg]) == null || inputs[arg].length < 3 || inputs[arg].length > 30){
				setWarnings(prev => ({...prev, [arg]: "Username is invalid"}));
				return false;
			}
			let getUser = await fetch(`${import.meta.env.VITE_SERVER}/profile?user=${inputs[arg]}`);
			if(getUser.status != 200){
				setWarnings(prev => ({...prev, [arg]: "This user does not exist"}));
				return false;
			}
			if(arg == 'addAdmin'){
				let res = await fetch(`${import.meta.env.VITE_SERVER}/admin?communityid=${props.communityid}&user=${inputs.addAdmin}`);
				if(res.status == 200){
					let data = await res.json();
					if(data.admin){
						setWarnings(prev => ({...prev, addAdmin: "User is already an administrator"}));
					}
					else{
						return true;
					}
				}
				else{
					setWarnings(prev => ({...prev, addAdmin: "Request failed; Please try again"}));
				}
				return false;
			}
			else if(arg == 'removeAdmin'){
				let res = await fetch(`${import.meta.env.VITE_SERVER}/admin?communityid=${props.communityid}&user=${inputs.removeAdmin}`);
				if(res.status == 200){
					let data = await res.json();
					if(!data.admin){
						setWarnings(prev => ({...prev, removeAdmin: "User is not an administrator"}));
					}
					else{
						return true;
					}
				}
				else{
					setWarnings(prev => ({...prev, removeAdmin: "Request failed; Please try again"}));
				}
				return false;
			}
			else if(arg == 'kickMember'){
				let res = await fetch(`${import.meta.env.VITE_SERVER}/member?communityid=${props.communityid}&user=${inputs.kickMember}`, {
					credentials: 'include'
				});
				if(res.status == 200){
					let data = await res.json();
					console.log(data);
					if(!data.member){
						setWarnings(prev => ({...prev, kickMember: "User is not a member"}));
					}
					else{
						return true;
					}
				}
				else{
					setWarnings(prev => ({...prev, kickMember: "Request failed; Please try again"}));
				}
				return false;
			}
		}
		else if(arg == 'banner'){
			return inputs.banner != null;
		}
	}

	async function handleSubmit(arg){
		if(arg == 'post' && await isValid(arg)){
			await uploadBytes(ref(homeRef, inputs.postMedia.id), inputs.postMedia);
			let res = await fetch(`${import.meta.env.VITE_SERVER}/community/home?communityid=${props.communityid}`, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					description: inputs.postDescription,
					files: [{type: inputs.postMedia.type, id: inputs.postMedia.id, position: 0}]
				})
			});
			if(res.status == 200){
				setWarnings(prev => ({...prev, postDescription: "", postInput: ""}));
				window.location.href = `/community?id=${props.communityid}`;
			}
			else{
				setWarnings(prev => ({...prev, postDescription: `Request Failed: Status ${res.status}`}));
			}
		}
		else if(arg == 'addAdmin' && await isValid(arg)){
			let res = await fetch(`${import.meta.env.VITE_SERVER}/admin?communityid=${props.communityid}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({username: inputs.addAdmin})
			});
			if(res.status == 200){
				setWarnings(prev => ({...prev, addAdmin: ""}));
				window.location.href = `/community?id=${props.communityid}`;
			}
			else{
				setWarnings(prev => ({...prev, addAdmin: `Request Failed: Status ${res.status}`}));
			}
		}
		else if(arg == 'removeAdmin' && await isValid(arg)){
			let res = await fetch(`${import.meta.env.VITE_SERVER}/admin?communityid=${props.communityid}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({username: inputs.removeAdmin})
			});
			if(res.status == 200){
				setWarnings(prev => ({...prev, removeAdmin: ""}));
				window.location.href = `/community?id=${props.communityid}`;
			}
			else{
				setWarnings(prev => ({...prev, removeAdmin: `Request Failed: Status ${res.status}`}));
			}
		}
		else if(arg == 'kickMember' && await isValid(arg)){
			let res = await fetch(`${import.meta.env.VITE_SERVER}/member?communityid=${props.communityid}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({username: inputs.kickMember})
			});
			if(res.status == 200){
				setWarnings(prev => ({...prev, kickMember: ""}));
				window.location.href = `/community?id=${props.communityid}`;
			}
			else{
				setWarnings(prev => ({...prev, kickMember: `Request Failed: Status ${res.status}`}));
			}
		}
		else if(arg == 'banner' && await isValid(arg)){
			await uploadBytes(ref(bannerRef, inputs.banner.id), inputs.banner);
			let res = await fetch(`${import.meta.env.VITE_SERVER}/community/banner?communityid=${props.communityid}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({banner: inputs.banner.id})
			});
			if(res.status == 200){
				setWarnings(prev => ({...prev, banner: ""}));
				window.location.href = `/community?id=${props.communityid}`;
			}
			else{
				setWarnings(prev => ({...prev, banner: `Request Failed: Status ${res.status}`}));
			}
		}
	}

	return (
		<div className="community-admin">
			<div className="community-admin__action-box">
				<div className="community-admin__header" onClick={() => handleClickAdminPanel('post')}>
					{!adminPanel.post && <FontAwesomeIcon icon={faAngleDown} />}
					{adminPanel.post && <FontAwesomeIcon icon={faAngleUp} />}
					<span className='community-admin__header-text'>Post on the home page</span>
				</div>
				{adminPanel.post &&
				<div className="community-admin__form community-admin__post">
					<div className="community-admin__label">Provide a description</div>
					<textarea className="community-admin__input  input--style" id="postDescription" value={inputs.postDescription} onChange={handleChange}></textarea>
					<div className="community-admin__warning" type="description">{warnings.postDescription}</div>

					<div className="community-admin__label">Upload media</div>
					<div className="community-admin__upload-box">
						<button type="button" className="community-admin__upload-button button--style" onClick={() => handleClickUpload('post')}>Browse</button>
						<input type="file" ref={uploadElementPost} onChange={() => handleFiles('post')}/>
						<div>{inputs.postMedia == null ? "No file selected" : inputs.postMedia.name}</div>
					</div>
					<div className="community-admin__warning" type="description">{warnings.postMedia}</div>

					<button className="community-admin__submit-button button--style" type="submit" onClick={() => handleSubmit('post')}>Post</button>
				</div>}
			</div>
			<div className="community-admin__action-box">
				<div className="community-admin__header" onClick={() => handleClickAdminPanel('banner')}>
					{!adminPanel.banner && <FontAwesomeIcon icon={faAngleDown} />}
					{adminPanel.banner && <FontAwesomeIcon icon={faAngleUp} />}
					<span className='community-admin__header-text'>Update banner</span>
				</div>
				{adminPanel.banner &&
				<div className="community-admin__form community-admin__banner">
					<div className="community-admin__label">Upload banner</div>
					<div className="community-admin__upload-box">
						<button type="button" className="community-admin__upload-button button--style" onClick={() => handleClickUpload('banner')}>Browse</button>
						<input type="file" ref={uploadElementBanner} onChange={() => handleFiles('banner')}/>
						<div>{inputs.banner == null ? "No file selected" : inputs.banner.name}</div>
					</div>
					<div className="community-admin__warning" type="description">{warnings.banner}</div>

					<button className="community-admin__submit-button button--style" type="submit" onClick={() => handleSubmit('banner')}>Update</button>
				</div>}
			</div>
			<div className="community-admin__action-box">
				<div className="community-admin__header" onClick={() => handleClickAdminPanel('kickMember')}>
					{!adminPanel.kickMember && <FontAwesomeIcon icon={faAngleDown} />}
					{adminPanel.kickMember && <FontAwesomeIcon icon={faAngleUp} />}
					<span className='community-admin__header-text'>Kick a member</span>
				</div>
				{adminPanel.kickMember && <div className="community-admin__form community-admin__kick">
					<div className="community-admin__label">Username</div>
					<input type="text" className="community-admin__input input--style" id="kickMember" value={inputs.kickMember} onChange={handleChange}/>
					<div className="community-admin__warning">{warnings.kickMember}</div>
					<button className="community-admin__submit-button button--style" type="submit" onClick={() => handleSubmit('kickMember')}>Kick</button>
				</div>}
			</div>
			<div className="community-admin__action-box">
				<div className="community-admin__header" onClick={() => handleClickAdminPanel('removeAdmin')}>
					{!adminPanel.removeAdmin && <FontAwesomeIcon icon={faAngleDown} />}
					{adminPanel.removeAdmin && <FontAwesomeIcon icon={faAngleUp} />}
					<span className='community-admin__header-text'>Remove an administrator</span>
				</div>
				{adminPanel.removeAdmin &&
				<div className="community-admin__form community-admin__remove">
					<div className="community-admin__label">Username</div>
					<input type="text" className="community-admin__input input--style" id="removeAdmin" value={inputs.removeAdmin} onChange={handleChange}/>
					<div className="community-admin__warning">{warnings.removeAdmin}</div>
					<button className="community-admin__submit-button button--style" type="submit" onClick={() => handleSubmit('removeAdmin')}>Remove</button>
				</div>}
			</div>
			<div className="community-admin__action-box">
				<div className="community-admin__header" onClick={() => handleClickAdminPanel('addAdmin')}>
					{!adminPanel.addAdmin && <FontAwesomeIcon icon={faAngleDown} />}
					{adminPanel.addAdmin && <FontAwesomeIcon icon={faAngleUp} />}
					<span className='community-admin__header-text'>Add an administrator</span>
				</div>
				{adminPanel.addAdmin &&
				<div className="community-admin__form community-admin__add">
					<div className="community-admin__label">Username</div>
					<input type="text" className="community-admin__input input--style" id="addAdmin" value={inputs.addAdmin} onChange={handleChange}/>
					<div className="community-admin__warning">{warnings.addAdmin}</div>
					<button className="community-admin__submit-button button--style" type="submit" onClick={() => handleSubmit('addAdmin')}>Add</button>
				</div>}
			</div>
		</div>
	);
}
