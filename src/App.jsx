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
import { getUsername } from './functions';
import logo from '/public/images/logo.png';
import './styles/style.css';
import './styles/auth.css';

export default function App(){
	let [login, setLogin] = React.useState(false);
	let [username, setUsername] = React.useState("");
	let [recentCommunities, setRecentCommunities] = React.useState([]);
	
	let theme = React.useRef('light');
	const navRef = React.useRef(null);
	const containerRef = React.useRef(null);

	const closed = React.useRef(false);
	const sidebarRef = React.useRef(null);
	
	React.useEffect(() => {
		const effect = async() => {
			let getUser = await getUsername();
			if(getUser.username){
				setUsername(getUser.username);
				setLogin(true);
			}
		};
		effect();
	}, []);

	React.useEffect(() => {
		if(localStorage.getItem('theme') && localStorage.getItem('theme') === 'dark'){
			theme.current = 'light';
		}
		else{
			theme.current = 'dark';
		}
		// Setting them wrong since we toggle it by below call
		handleThemeToggle();

		if(localStorage.getItem('sidebarClosed') && localStorage.getItem('sidebarClosed') === 'true'){
			closed.current = false;
		}
		else{
			closed.current = true;
		}
		// Setting them wrong since we toggle it by below call
		handleSidebarClose();
	});

	function handleThemeToggle(){
		localStorage.setItem('theme', theme.current === 'light' ? 'dark' : 'light');
		
		if(navRef.current){
			navRef.current.classList.add(theme.current === 'light' ? 'dark' : 'light');
			navRef.current.classList.remove(theme.current === 'light' ? 'light' : 'dark');
		}

		if(containerRef.current){
			containerRef.current.classList.add(theme.current === 'light' ? 'dark' : 'light');
			containerRef.current.classList.remove(theme.current === 'light' ? 'light' : 'dark');
		}

		theme.current = theme.current === 'light' ? 'dark' : 'light';
	}

	function handleRedirectCommunity(id){
		window.location.href = `/community?id=${id}`;
	}
	
	function handleSidebarClose(){
		localStorage.setItem('sidebarClosed', !closed.current);
		
		if(sidebarRef.current){
			closed.current ? sidebarRef.current.classList.remove('sidebar--closed') : sidebarRef.current.classList.add('sidebar--closed');
		}

		closed.current = !closed.current;
	}

	function RecentCommunityElements(){
		return recentCommunities.map(obj => {
			return(
				<div className="sidebar__nav" key={obj.community_id} onClick={() => handleRedirectCommunity(obj.community_id)}>{obj.name}</div>
			)
		})
	}

	function Bars(){
		return (
			<React.Fragment>
				<nav ref={navRef} className='navbar'>
					<Link to="/">
						<img src={logo} alt="" className="navbar__logo" />
					</Link>
					<Search />
					<div className="navbar__button-box">
						{theme.current == 'dark' && <FontAwesomeIcon className="navbar__theme-toggle" icon={faSun} onClick={handleThemeToggle}/>}
						{theme.current == 'light' && <FontAwesomeIcon className="navbar__theme-toggle" icon={faMoon} onClick={handleThemeToggle}/>}
						{!login && <Link to="/login" className="navbar__login" >Login</Link>}
						{login &&
						<Link to={`/profile?user=${username}`} className="navbar__profile">
							<FontAwesomeIcon className="navbar__profile-icon" icon={faUser} />
						</Link>}
						{/* <Link to="/settings?username=xxx" className="navbar__settings">
							<FontAwesomeIcon className="navbar__settings-icon" icon={faGear} />
						</Link> */}
					</div>
				</nav>
				<div className='container' ref={containerRef}>
					<div className='sidebar__container' ref={sidebarRef}>
						<div className='sidebar'>
							<Link to={login ? "/community/create" : "/login"} className="sidebar__nav">+ Create Community</Link>
							<Link to="/chat" className="sidebar__nav">Chat</Link>
							{/* {login && recentCommunities.length > 0 && <div className="sidebar__heading">Recent Communities</div>}
							{login && <RecentCommunityElements />} */}
						</div>
					</div>
					<div className="sidebar__popper" onClick={handleSidebarClose}></div>
					<Outlet />
				</div>
			</React.Fragment>
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
