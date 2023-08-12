import React from "react";
import ErrorPage from "./ErrorPage";
import urlParse from "url-parse";
import cookies from "js-cookie";
import { getUsername } from "../../functions";
import genericPhoto from '../assets/profile.jpg';
import '../styles/profile.css';

export default function Profile(){
	let [userDetails, setUserDetails] = React.useState({});
	let [username, setUsername] = React.useState("");
	let [valid, setValid] = React.useState(false);
	let [login, setLogin] = React.useState(false);
	let [follows, setFollows] = React.useState(false);
	let {query} = urlParse(window.location.href, true);

	React.useEffect(() => {
		let effect = async() => {
			let res = await fetch(`${import.meta.env.VITE_SERVER}/profile?user=${query.user}`);
			if(res.status == 200){
				let data = await res.json();
				setUserDetails({...data});
				setValid(true);
			}
			else{
				setValid(false);
			}
			if(cookies.get('token')){
				setUsername((await getUsername()).username);
				setLogin(true);
			}
		};
		effect();
	}, []);

	React.useEffect(() => {
		(async() => {
			if(login){
				let res = await fetch(`${import.meta.env.VITE_SERVER}/follow?username=${userDetails.username}`, {
					credentials: 'include'
				});
				if(res.status == 200){
					let data = await res.json();
					setFollows(data.follows);
				}
			}
		})();
	}, [userDetails, login]);

	function handleLogout(){
		cookies.remove('token');
		window.location.href = '/socmed/login';
	}

	async function handleClickMessage(){
		let res = await fetch(`${import.meta.env.VITE_SERVER}/chat/private/room?username=${userDetails.username}`);
		if(res.status != 200){
			return;
		}
		let data = await res.json();
		await fetch('${import.meta.env.VITE_SERVER}/chat/contact', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({roomId: data.roomId})
		});
		window.location.href = `/socmed/chat?id=${data.roomId}`;
	}

	async function handleFollow(){
		let method = '';
		if(follows){
			method = 'DELETE';
		}
		else{
			method = 'POST';
		}
		await fetch(`${import.meta.env.VITE_SERVER}/follow`, {
			method,
			credentials: 'include',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({username: userDetails.username})
		});
		setFollows(prev => !prev);
	}

	if(!valid){
		return <ErrorPage message="User not Found" />
	}

	return (
		<div className="profile">
			<div className="profile__container container-left">
				<img src={genericPhoto} className="profile__image" alt="" />
				<div className="profile__username"><i>{userDetails.username}</i></div>
				<div className="profile__name">{userDetails.name}</div>
				<div className="profile__button-box">
					{login && username != userDetails.username &&
						<button type="button" className="profile__button button--style" onClick={handleFollow}>{follows ? 'Unfollow' : 'Follow'}</button>
					}
					{login && <button type="button" className="profile__button button--style" onClick={handleLogout}>Logout</button>}
				</div>
			</div>
			<div className="profile__container container-right">
				{/* <div className="profile__coins">{userDetails.coins} coins</div> */}
				<div className="profile__followers">{userDetails.follower_count} followers</div>
				<div className="profile__following">{userDetails.following_count} following</div>
				<div className="profile__date">Joined on {userDetails.join_date}</div>
				{login && username != userDetails.username &&
					<button className="profile__button profile__message-button button--style" type="button" onClick={handleClickMessage}>Message</button>
				}
			</div>
		</div>
	);
}
