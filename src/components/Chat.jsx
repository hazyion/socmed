import React from 'react';
import socket from '../socket';
import EmojiPicker from 'emoji-picker-react';
import ErrorPage from '../components/ErrorPage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpFromBracket, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { faFaceLaughBeam } from '@fortawesome/free-regular-svg-icons';
import { getUsername, chatTime } from '../functions';
import '../styles/chat.css';
import URLParse from 'url-parse';

export default function Chat(){
	let [login, setLogin] = React.useState(false);
	let [username, setUsername] = React.useState("");
	let [socketState, setSocketState] = React.useState({
		events: [],
		isConnected: socket.connected,
	});
	let [userList, setUserList] = React.useState([]);
	let [users, setUsers] = React.useState([]);
	let [emojiOpen, setEmojiOpen] = React.useState(false);
	let [selectedUser, setSelectedUser] = React.useState('');
	let [input, setInput] = React.useState("");
	let [messages, setMessages] = React.useState([]);
	let {query, pathname} = URLParse(window.location.href, true);
	let url = URLParse(window.location.href, true);
	let scroller = React.useRef(null);

	function handleChange(event){
		setInput(event.target.value);
	}

	function handleUserSelect(roomId){
		if(history.pushState) {
			var newurl = window.location.origin + window.location.pathname + `?id=${roomId}`;
			window.history.pushState({path:newurl}, '', newurl);
		}
		setSelectedUser(roomId);
	}

	function handleSend(){
		if(input.length == 0){
			return;
		}
		if(pathname == '/chat'){
			socket.emit('private_message', {message: input, time: new Date()});
		}
		else{
			socket.emit('community_message', {message: input, time: new Date()});
		}
		setMessages(prev => [...prev, {message: input, username: username, time: new Date()}]);
		setInput("");
	}

	function SidebarElements(){
		return users.map(obj => {
			let className = "chat__user";
			if(obj.roomId == selectedUser){
				className += " chat__user--active";
			}
			return <div className={className} key={obj.username} onClick={() => handleUserSelect(obj.roomId)}>{obj.username}</div>;
		});
	}

	function MessageElements(){
		return messages.map(obj => {
			let datetime = new Date(obj.time);
			return (
				<div className={obj.username == username ? "chat__message chat__message-self" : "chat__message"}>
					<div className="chat__message-header">
						{obj.username != username && <span>{obj.username}</span>}
						<span className='chat__header-gap'></span>
						<span>{chatTime(datetime)}</span>
					</div>
					<div className="chat__message-body">{obj.message}</div>
				</div>
			);
		});
	}

	React.useEffect(() => {
		if(scroller.current){
			scroller.current.scrollTo(0, scroller.current.scrollHeight);
		}
	}, [messages]);

	React.useEffect(() => {
		function onConnect() {
			setSocketState(prev => ({...prev, isConnected: true}));
		}
	
		function onDisconnect() {
			setSocketState(prev => ({...prev, isConnected: false}));
		}
	
		function onLeaveEvent(value) {
			setSocketState(prev => ({...prev, events: [...prev.events, value]}));
		}

		function onReceiveEvent(value) {
			setSocketState(prev => ({...prev, events: [...prev.events, value]}));
		}

		function onAnyEvent(event, ...args){
			return;
		}

		function onUsersEvent(value){
			setUserList(value);
		}

		// function onUserConnectedEvent(value){
		// 	if(!socketState.users.find(obj => obj.username === value.username)){
		// 		setSocketState(prev => ({...prev, users: [...prev.users, value]}));
		// 	}
		// }

		function onPrivateMessageEvent(value){
			setMessages(prev => [...prev, {username: value.from, time: value.time, message: value.message}]);
		}

		function onCommunityMessageEvent(value){
			setMessages(prev => [...prev, {username: value.from, time: value.time, message: value.message}]);
		}
	
		socket.on('connect', onConnect);
		socket.on('disconnect', onDisconnect);
		socket.on('receive', onReceiveEvent);
		socket.on('leave', onLeaveEvent);
		socket.on('users', onUsersEvent);
		socket.on('private_message', onPrivateMessageEvent);
		socket.on('community_message', onCommunityMessageEvent);
		// socket.on('user_connected', onUserConnectedEvent);
		socket.onAny(onAnyEvent);
	
		return () => {
			socket.off('connect', onConnect);
			socket.off('disconnect', onDisconnect);
			socket.off('leave', onLeaveEvent);
			socket.off('receive', onReceiveEvent);
			socket.off('users', onUsersEvent);
			// socket.off('user_connected', onUserConnectedEvent);
			socket.off('private_message', onPrivateMessageEvent);
			socket.off('community_message', onCommunityMessageEvent);
			socket.offAny(onAnyEvent);
		};
	}, []);

	React.useEffect(() => {
		const effect = async() => {
			let getUser = await getUsername();
			if(getUser.username){
				setUsername(getUser.username);
				setLogin(true);
			}
			socket.auth = {username: getUser.username, room: `${query.id}`};
			socket.connect();
			if(pathname == '/chat'){
				let res = await fetch(`${import.meta.env.VITE_SERVER}/chat/private?roomid=${query.id}`);
				if(res.status == 200){
					setMessages(await res.json());
				}
			}
			else{
				let res = await fetch(`${import.meta.env.VITE_SERVER}/chat/community?roomid=${query.id}`);
				if(res.status == 200){
					setMessages(await res.json());
				}
			}
		};
		effect();
	}, [selectedUser]);

	React.useEffect(() => {
		const effect = async() => {
			if(pathname == '/community')
				return;
			let res = await fetch(`${import.meta.env.VITE_SERVER}/chat/contact`, {credentials: 'include'});
			let data = await res.json();
			if(userList.length > 0){
				data = data.map(obj => {
					let userObj = userList.find(x => x.username == obj.username);
					if(!userObj){
						return obj;
					}
					return {
						...obj,
						online: false,
						userID: userObj.userID
					}
				});
			}
			setUsers(data);
		};
		effect();
	}, [userList]);


	if(!login){
		return <ErrorPage message="You need to login to be able to chat"/>;
	}

	return (
		<div className={pathname == '/chat' ? "chat" : "chat--community"}>
			{query.id &&
			<div className="chat__body">
				<div className="chat__message-box" ref={scroller}>
					<MessageElements />
				</div>
				<div className="chat__chatbar">
					<FontAwesomeIcon icon={faFaceLaughBeam} className="chat__emoji-icon chat__icon" onClick={() => setEmojiOpen(prev => !prev)}/>
					{emojiOpen && <EmojiPicker className="chat__emoji-box"/>}
					<FontAwesomeIcon icon={faArrowUpFromBracket} className="chat__upload-icon chat__icon" />
					<input type="text" name="message" className='chat__input input--style' value={input} disabled={query.roomid} autoComplete="off" onChange={handleChange}/>
					<FontAwesomeIcon icon={faPaperPlane} className="chat__send-icon chat__icon" onClick={handleSend}/>
				</div>
			</div>}
			{!query.id && <ErrorPage message="Select a chat" />}
			{pathname == '/chat' && <div className="chat__sidebar">
				<SidebarElements />
			</div>}
		</div>
	)
}
