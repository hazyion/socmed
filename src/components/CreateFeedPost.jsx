import React from "react";
import urlParse from 'url-parse';
import ErrorPage from "./ErrorPage";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import { nanoid } from 'nanoid';

export default function CreateFeedPost(){
	let [inputs, setInputs] = React.useState({caption: "", files: []});
	let [files, setFiles] = React.useState([]);
	let [warnings, setWarnings] = React.useState({caption: "", files: ""});
	let [valid, setValid] = React.useState(true);
	const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
	const firebase = getStorage(initializeApp(firebaseConfig));
	const storageRef = ref(firebase);
	const feedRef = ref(storageRef, 'feed');
	let uploadElement = React.useRef(null);
	let fileTypes = ['image/jpeg', 'image/gif', 'image/png', 'image/webp', 'video/ogg', 'video/mp4', 'video/webm'];
	let {query} = urlParse(window.location.href, true);

	React.useEffect(() => {
		if(!query.communityid){
			setValid(false);
		}
		else{
			fetch(`https://socmed-server.vercel.app/api/community?id=${query.communityid}`)
			.then(res => {
				if(res.status == 400){
					setValid(false);
				}
				else{
					setValid(true);
				}
			});
		}
	}, []);

	if(!valid){
		return <ErrorPage />;
	}

	function handleChange(event){
		let warning = "";
		if(event.target.value.length > 400){
			warning = "Caption cannot be longer than 400 characters";
		}
		setWarnings(prev => ({...prev, caption: warning}));
		setInputs(prev => ({...prev, caption: event.target.value}));
	}

	function handleFiles(){
		let file = uploadElement.current.files[0];
		let warning = "";
		if(files.length == 4){
			warning = "Cannot include more than 4 media files";
		}
		else if(!fileTypes.some(type => file.type === type)){
			warning = "File must be of a valid image or video format";
		}
		else if(file.size >= 300000 && file.type.substr(0, 5) === "image"){
			warning = "Images cannot be larger than 300 kB";
		}
		else if(file.size >= 10000000){
			warning = "Videos cannot be larger than 10 MB";
		}
		else{
			let id = 'f_' + nanoid();
			file.id = id;
			let position = files.length;
			setFiles(prev => {
				prev.push(file);
				return prev;
			});
			setInputs(prev => {
				let arr = prev.files;
				arr.push({position, id, type: file.type});
				return {...prev, arr};
			});
		}
		setWarnings(prev => ({...prev, files: warning}));
	}

	function handleClickUpload(){
		uploadElement.current.files = null;
		uploadElement.current.click();
	}

	async function handleClickPost(){
		if(inputs.caption.length > 400){
			return;
		}
		if(inputs.caption.length == 0 && files.length == 0){
			setWarnings(prev => ({...prev, caption: "Post cannot be empty"}));
			return;
		}
		for(let i of files){
			const fileRef = ref(feedRef, i.id);
			await uploadBytes(fileRef, i);
		}
		await fetch(`https://socmed-server.vercel.app/api/community/feed?communityid=${query.communityid}`, {
			method: 'POST',
			body: JSON.stringify(inputs),
			headers: {'Content-Type': 'application/json'},
			credentials: 'include'
		});
		window.location.href = `/socmed/community?id=${query.communityid}`;
	}

	function handleClickDelete(id){
		setFiles(prev => prev.filter(file => file.id !== id));
		setInputs(prev => {
			let arr = [];
			let count = 0;
			for(let i = 0; i < prev.files.length; i++){
				if(prev.files[i].id !== id){
					arr.push({position: count, id: prev.files[i].id});
					count += 1;
				}
			}
			return {...prev, files: arr};
		});
	}

	return(
		<div className="community-make-post">
			<div className="community-make-post__header">Create a new post</div>
			<div className="community-make-post__form">
				<div className="community-make-post__label">Caption your post</div>
				<textarea type="text" className="community-make-post__input input--style" value={inputs.caption} onChange={handleChange}></textarea>
				<div className="community-make-post__warning">{warnings.caption}</div>

				<div className="community-make-post__label">Add Media</div>
				<div className="community-make-post__upload-box">
					<input type="file" ref={uploadElement} onChange={handleFiles}/>
					<button type="button" className="community-make-post__upload-button button--style" onClick={handleClickUpload}>Browse</button>
					{files.map(file => <div className="community-make-post__file" key={file.id}>{file.name}<span className="community-make-post__delete-file" onClick={() => handleClickDelete(file.id)}>x</span></div>)}
				</div>
				<div className="community-make-post__warning">{warnings.files}</div>

				<button className="community-make-post__submit-button button--style" onClick={handleClickPost}>Post</button>
			</div>
		</div>
	);
}