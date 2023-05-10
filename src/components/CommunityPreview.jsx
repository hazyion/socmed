import React from "react";
import { Link } from 'react-router-dom';
import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

export default function CommunityPreview(props){
	let [source, setSource] = React.useState("");
	const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
	const firebase = getStorage(initializeApp(firebaseConfig));
	const storageRef = ref(firebase);
	const bannerRef = ref(storageRef, 'banner');

	React.useEffect(() => {
		async function effect(){
			try{
				let src = await getDownloadURL(ref(bannerRef, props.banner));
				setSource(src);
			}
			catch(error){
				console.log("Error: Banner couldn't be fetched");
			}
		}
		effect();
	}, []);

	return (
		<Link to={`/community?id=${props.id}`} className="community-preview">
			<img src={source} alt="" className="community-preview__image" />
			<div className="community-preview__text-box">
				<h2 className="community-preview__heading">{props.name}</h2>
				<div className="community-preview__description">{props.description.length > 85 ? props.description.substr(0,82) + "..." : props.description}</div>
			</div>
		</Link>
	)
}