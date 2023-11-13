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
import uniqid from 'uniqid';
import './styles/style.css';
import './styles/auth.css';

export default function App(){
	let [login, setLogin] = React.useState(false);
	let [username, setUsername] = React.useState("");
	let [recentCommunities, setRecentCommunities] = React.useState([]);
	let [closed, setClosed] = React.useState(false);
	let [theme, setTheme] = React.useState('light');
	const appRef = React.useRef(null);

	const rerender = React.useMemo(() => {console.log('china'); return uniqid();}, []);
	
	function handleThemeToggle(){
		setTheme(prev => {
			if(prev == 'light'){
				localStorage.setItem('theme', 'dark');
				return 'dark';
			}
			localStorage.setItem('theme', 'light');
			return 'light';
		});
	}

	React.useEffect(() => {
		if(localStorage.getItem('theme')){
			if(localStorage.getItem('theme') === 'dark'){
				setTheme('dark');
			}
			else{
				setTheme('light');
			}
		}
	}, []);

	function handleRedirectCommunity(id){
		window.location.href = `/community?id=${id}`;
	}
	
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
				<nav className={`navbar ${theme}`}>
					<Link to="/">
						<img src={logo} alt="" className="navbar__logo" />
					</Link>
					<Search />
					<div className="navbar__button-box">
						{theme == 'dark' && <FontAwesomeIcon className="navbar__theme-toggle" icon={faSun} onClick={handleThemeToggle}/>}
						{theme == 'light' && <FontAwesomeIcon className="navbar__theme-toggle" icon={faMoon} onClick={handleThemeToggle}/>}
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
				<div className={`container ${theme}`}>
					<div className={`sidebar__container${closed ? ' sidebar--closed' : ''}`}>
						<div className='sidebar'>
							<Link to={login ? "/community/create" : "/login"} className="sidebar__nav">+ Create Community</Link>
							<Link to="/chat" className="sidebar__nav">Chat</Link>
							{/* {login && recentCommunities.length > 0 && <div className="sidebar__heading">Recent Communities</div>}
							{login && <RecentCommunityElements />} */}
						</div>
					</div>
					<div className="sidebar__popper" onClick={() => setClosed(prev => !prev)}></div>
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
							<Route index element={<Home rerender={rerender}/>} />
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
