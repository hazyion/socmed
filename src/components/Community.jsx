import React from 'react';
import urlParse from 'url-parse';
import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGhost, faAngleRight, faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import Chat from './Chat';
import Modal from './Modal';
import CommunityAdmin from './CommunityAdmin';
import ErrorPage from './ErrorPage';
import { getUsername } from '../../functions';
import '../styles/community.css';

export default function Community(props){
	let [selected, setSelected] = React.useState('home');
	let [community, setCommunity] = React.useState({});
	let [valid, setValid] = React.useState(true);
	let [login, setLogin] = React.useState(false);
	let [loading, setLoading] = React.useState({main: true, feed: true, home: true});
	let [homeLoaded, setHomeLoaded] = React.useState({});
	let [posts, setPosts] = React.useState([]);
	let [sources, setSources] = React.useState([]);
	let [homePosts, setHomePosts] = React.useState([]);
	let [homeSources, setHomeSources] = React.useState([]);
	let [modal, setModal] = React.useState({src: "", visible: false});
	let [member, setMember] = React.useState(false);
	let [admin, setAdmin] = React.useState(false);
	let {query} = urlParse(window.location.href, true);
	const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
	const firebase = getStorage(initializeApp(firebaseConfig));
	const storageRef = ref(firebase);
	const bannerRef = ref(storageRef, 'banner');
	const feedRef = ref(storageRef, 'feed');
	const homeRef = ref(storageRef, 'home');

	function handleImageLoad(id){
		if(!homeLoaded[id]){
			setHomeLoaded(prev => ({...prev, [id]: true}));
		}
	}

	function handleClickNav(name){
		if(name !== selected){
			setSelected(name);
		}
	}

	function addFont(name){
		return name === selected ? " community-nav--font-big" : "";
	}

	function handleDoubleclickMedia(obj){
		setModal(obj);
		window.scroll(null);
	}

	function handleSwipe(postID, shift){
		setSources(prev => prev.map(sourceObj => {
			if(sourceObj.id == postID){
				return {...sourceObj, active: sourceObj.active + shift};
			}
			return sourceObj;
		}));
	}

	function MediaElement(props){
		let id = props.postID;

		if(props.category == 'feed'){
			let sourceObj = sources.find(obj => obj.id == id);
			let {type, src} = sourceObj.sources.find(obj => obj.pos == sourceObj.active);
	
			if(type.substr(0, 5) === 'image'){
				return (
					<img
						className="feed-post__media feed-post__image"
						src={src}
						alt=""
						onDoubleClick={() => handleDoubleclickMedia({src, visible: true})}
					/>
				);
			}
			else{
				return (
					<video className="feed-post__media feed-post__video" controls muted>
						<source src={src} type={type} />
					</video>
				);
			}
		}
		else if(props.category == 'home'){
			let {type, src} = homeSources.find(obj => obj.id == id);
	
			if(type.substr(0, 5) === 'image'){
				return (
					<img
						className="community-home__media"
						src={src}
						alt=""
						onLoad={() => handleImageLoad(props.postID)}
						onDoubleClick={() => handleDoubleclickMedia({src, visible: true})}
					/>
				);
			}
			else{
				return (
					<video className="community-home__media" controls muted>
						<source src={src} type={type} />
					</video>
				);
			}
		}
	}

	function handleClickJoin(){
		let method = 'POST';
		if(member){
			method = 'DELETE';
		}
		setTimeout(() => {
			setMember(prev => !prev);
		}, 200);
		fetch(`https://socmed-server.vercel.app/api/member?communityid=${query.id}`, {method});
	}

	function handleLike(id, liked){
		setPosts(prev => {
			return prev.map(post => {
				if(post.id === id){
					if(!liked)
						return {...post, likes: post.likes + 1, liked: !post.liked};
					else
						return {...post, likes: post.likes - 1, liked: !post.liked};
				}
				else{
					return post;
				}
			});
		});
	}

	function FeedElements(){
		return posts.map(obj => {
			let sourceObj = sources.find(sourceObj => sourceObj.id == obj.id);
			let leftClass = "", rightClass = "", leftDisabled = false, rightDisabled = false;
			if(sourceObj.active == 0){
				leftClass = "element--hide";
				leftDisabled = true;
			}
			if(sourceObj.active == sourceObj.sources.length - 1){
				rightClass = "element--hide";
				rightDisabled = true;
			}
			return (
				<div className="feed-post" key={obj.id}>
					<div className="feed-post__username">- {obj.created_by}</div>
					<div className="feed-post__caption">{obj.caption}</div>
					{obj.media.length > 0 &&
					<div className="feed-post__content-box">
						<button type="button" disabled={leftDisabled} className="feed-post__button feed-post__left" onClick={() => handleSwipe(obj.id, -1)}>
							<FontAwesomeIcon className={leftClass} icon={faAngleLeft}></FontAwesomeIcon>
						</button>
						<MediaElement postID={obj.id} category={'feed'}/>
						<button type="button" disabled={rightDisabled} className="feed-post__button feed-post__right" onClick={() => handleSwipe(obj.id, 1)}>
							<FontAwesomeIcon className={rightClass} icon={faAngleRight}></FontAwesomeIcon>
						</button>
					</div>}
					<div className="feed-post__like-box">
						<FontAwesomeIcon icon={faGhost} className="feed-post__like-icon" onClick={() => handleLike(obj.id, obj.liked)}/>
						<div className="feed-post__like-count">{obj.likes}</div>
					</div>
				</div>
			);
		});
	}

	function HomeElements(){
		return homePosts.map(post => {
			return <MediaElement key={post.id} postID={post.id} category={'home'}/>;
		});
	}

	React.useEffect(() => {
		const effect = async() => {
			let getUser = await getUsername();
			if(getUser.username){
				setLogin(true);
			}

			let res = await fetch(`https://socmed-server.vercel.app/api/community?id=${query.id}`);
			if(res.status == 200){
				let data = await res.json();
				data.community.src = await getDownloadURL(ref(bannerRef, data.community.banner));
				setCommunity(data.community);
			}
			else{
				setValid(false);
				return;
			}

			res = await fetch(`https://socmed-server.vercel.app/api/admin?communityid=${query.id}`);
			if(res.status == 200){
				let data = await res.json();
				setAdmin(data.admin);
			}
			else{
				setValid(false);
				return;
			}

			res = await fetch(`https://socmed-server.vercel.app/api/community/feed?communityid=${query.id}`);
			if(res.status == 200){
				let data = await res.json();
				setPosts(data.posts.map(post => ({...post, liked: false})));
				if(!data.posts.length){
					setLoading(prev => ({...prev, feed: false}));
				}
			}

			res = await fetch(`https://socmed-server.vercel.app/api/member?communityid=${query.id}`);
			if(res.status == 200){
				let data = await res.json();
				if(data.member){
					setMember(data.member);
				}
			}

			res = await fetch(`https://socmed-server.vercel.app/api/community/home?communityid=${query.id}`);
			if(res.status == 200){
				let data = await res.json();
				setHomePosts(data.posts);
				let obj = {};
				data.posts.map(post => {obj[post.id] = false});
				setHomeLoaded(obj);
				if(!data.posts.length)
					setLoading(prev => ({...prev, home: false}));
			}
			setLoading(prev => ({...prev, main: false}));
		};
		effect();
	}, []);

	React.useEffect(() => {
		(async() => {
			let arr = [];
			for(let post of posts){
				let sources = [];
				for(let file of post.media){
					let src = await getDownloadURL(ref(feedRef, file.file_id));
					sources.push({src, pos: file.position, type: file.type});
				}
				arr.push({id: post.id, sources, active: 0});
			}
			setSources(arr);
			if(posts.length){
				setLoading(prev => ({...prev, feed: false}));
			}
		})();
	}, [posts]);

	React.useEffect(() => {
		(async() => {
			let arr = [];
			for(let post of homePosts){
				let file = post.media[0];
				let src = await getDownloadURL(ref(homeRef, file.file_id));
				arr.push({id: post.id, src, type: file.type});
			}
			setHomeSources(arr);
		})();
	}, [homePosts]);

	React.useEffect(() => {
		if(!Object.keys(homeLoaded).length){
			return;
		}
		if(loading.home){
			setLoading(prev => ({...prev, home: !Object.keys(homeLoaded).every(id => homeLoaded[id])}));
		}
	}, [homeLoaded]);

	if(!valid || !query.id){
		return <ErrorPage error/>;
	}

	if(loading.main){
		return <ErrorPage loading/>;
	}

	return(
		<div className="community">
			{modal.visible && <Modal setModal={setModal} {...modal}/>}
			<div className="community-navbar">
				<div className={"community-nav"+addFont('home')} onClick={() => handleClickNav('home')}>HOME</div>
				<div className={"community-nav"+addFont('feed')} onClick={() => handleClickNav('feed')}>FEED</div>
				<div className={"community-nav"+addFont('talk')} onClick={() => handleClickNav('talk')}>TALK</div>
				{admin && <div className={"community-nav"+addFont('admin')} onClick={() => handleClickNav('admin')}>ADMIN</div>}
			</div>
			{selected === 'home' &&
			<div className="community-home">
				<div className="community-home__hero">
					<img src={community.src} alt="" className="community-home__banner" />
					<div className="community-home__text-box">
						<div className="community-home__text-box-left">
							<div className="community-home__name">{community.name}</div>
							<div className="community-home__description">{community.description}</div>
							<div>
								<span className="community-home__created">Created on {community.create_date.substr(0, 10)}</span>
								{'\u2022'}
								<span className="community-home__member-count">{community.member_count} {community.member_count == 1 ? 'member' : 'members'}</span>
							</div>
						</div>
						<div className="community-home__text-box-right">
							<button className="community-home__join-button button--style" type="button" onClick={handleClickJoin}>{member ? 'Leave' : 'Join'}</button>
						</div>
					</div>
				</div>
				{loading.home && <ErrorPage loading />}
				<div className={"community-home__media-box" + ((loading.home || !homeSources.length) ? " element--remove" : "")}>
					{homeSources.length > 0 && <HomeElements />}
				</div>
			</div>}
			{selected === 'feed' &&
				<div className="community-feed">
					<div className="community-feed__header">
						<Link to={`/socmed/community/feed/create?communityid=${query.id}`} className="community-feed__make-post-button">+ Make a post</Link>
					</div>
					{loading.feed ? <ErrorPage loading /> : (sources.length > 0 ? <FeedElements /> : <ErrorPage message='Be the first to make a post!' />)}
				</div>
			}
			{selected === 'talk' && member && <Chat />}
			{selected === 'talk' && !member && <ErrorPage message='You need to join this community to be able to send messages'/>}
			{selected === 'admin' && admin && <CommunityAdmin communityid={query.id}/>}
		</div>
	);
}