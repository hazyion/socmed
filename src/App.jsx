import React from "react";
import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faUser, faGear } from '@fortawesome/free-solid-svg-icons';
import { faMoon, faSun } from '@fortawesome/free-regular-svg-icons';
import Login from './components/Login';
import Signup from './components/Signup';
import Search from "./components/Search";
import Home from './components/Home';
import Community from "./components/Community";
import CreateCommunity from "./components/CreateCommunity";
import Profile from './components/Profile';
import Chat from './components/Chat';
import CreateFeedPost from './components/CreateFeedPost';
import ErrorPage from './components/ErrorPage';
import { getUsername } from '../functions';
import logo from '/public/images/logo.png';
import './styles/style.css';
import './styles/auth.css';

export default function App(){
	
	let [login, setLogin] = React.useState(false);
	let [username, setUsername] = React.useState("");
	let [recentCommunities, setRecentCommunities] = React.useState([]);
	// let [dark, setDark] = React.useState(false);
	const appRef = React.useRef(null);
	
	// function handleDarkToggle(){
	// 	setDark(prev => !prev);
	// }

	// React.useEffect(() => {
	// 	if(localStorage.getItem('dark')){
	// 		if(localStorage.getItem('dark') === '0'){
	// 			setDark(false);
	// 		}
	// 		else{
	// 			setDark(true);
	// 		}
	// 	}
	// 	return () => {
	// 		localStorage.setItem('dark', dark ? '0' : '1');
	// 	}
	// }, []);

	// React.useEffect(() => {
	// 	if(appRef.current == null){
	// 		return;
	// 	}
	// 	const effect = async() => {
	// 		if(!dark){
	// 			appRef.current.style.setProperty('--active-bg', 'var(--light-bg)');
	// 			appRef.current.style.setProperty('--active-text', 'var(--light-text)');
	// 			appRef.current.style.setProperty('--active-border', 'var(--light-border)');
	// 			appRef.current.style.setProperty('--active-accent', 'var(--light-accent)');
	// 		}
	// 		else{
	// 			appRef.current.style.setProperty('--active-bg', 'var(--dark-bg)');
	// 			appRef.current.style.setProperty('--active-text', 'var(--dark-text)');
	// 			appRef.current.style.setProperty('--active-border', 'var(--dark-border)');
	// 			appRef.current.style.setProperty('--active-accent', 'var(--dark-accent)');
	// 		}
	// 	};
	// 	effect();
	// }, [dark]);

	function handleRedirectCommunity(id){
		window.location.href = `/socmed/community?id=${id}`;
	}
	
	React.useEffect(() => {
		const effect = async() => {
			let getUser = await getUsername();
			if(getUser.username){
				setUsername(getUser.username);
				setLogin(true);
				// let res = await fetch(`${import.meta.env.VITE_SERVER}/community/recent`, {
				// credentials: 'include'
				// });
				// let data = await res.json();
				// setRecentCommunities(data.recentCommunities);
			}
		};
		effect();
	}, []);

	function RecentCommunityElements(){
		return recentCommunities.map(obj => {
			return(
				<div className="sidebar__nav" key={obj.community_id} onClick={() => handleRedirectCommunity(obj.community_id)}>{obj.name}</div>
			)
		})
	}

	function Bars(){
		return (
			<div className="container" ref={appRef}>
				<nav className="navbar">
					<Link to="/socmed">
						<img src={logo} alt="" className="navbar__logo" />
					</Link>
					<Search />
					<div className="navbar__button-box">
						{/* {dark && <FontAwesomeIcon className="navbar__theme-toggle" icon={faSun} onClick={handleDarkToggle}/>}
						{!dark && <FontAwesomeIcon className="navbar__theme-toggle" icon={faMoon} onClick={handleDarkToggle}/>} */}
						{!login && <Link to="/socmed/login" className="navbar__login" >Login</Link>}
						{login &&
						<Link to={`/socmed/profile?user=${username}`} className="navbar__profile">
							<FontAwesomeIcon className="navbar__profile-icon" icon={faUser} />
						</Link>}
						{/* <Link to="/socmed/settings?username=xxx" className="navbar__settings">
							<FontAwesomeIcon className="navbar__settings-icon" icon={faGear} />
						</Link> */}
					</div>
				</nav>
				<div className="body">
					<div className="sidebar">
						<Link to="/socmed/community/create" className="sidebar__nav">+ Create Community</Link>
						<Link to="/socmed/chat" className="sidebar__nav">Chat</Link>
						{/* {login && recentCommunities.length > 0 && <div className="sidebar__heading">Recent Communities</div>}
						{login && <RecentCommunityElements />} */}
					</div>
					<Outlet />
				</div>
			</div>
		)
	}

	return (
		<BrowserRouter>
				<Routes>
					<Route path={import.meta.env.BASE_URL}>
						<Route path='login' element={<Login />} />
						<Route path='signup' element={<Signup />} />
						<Route element={<Bars/>}>
							<Route index element={<Home />} />
							<Route path='community' element={<Community />} />
							<Route path='community/create' element={<CreateCommunity />} />
							<Route path='community/feed/create' element={<CreateFeedPost />} />
							<Route path='profile' element={<Profile />} />
							<Route path='chat' element={<Chat />} />
						</Route>
					</Route>
					<Route path='*' element={<ErrorPage />} />
				</Routes>
		</BrowserRouter>
	)
}
