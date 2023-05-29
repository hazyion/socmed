import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faUser, faTableColumns } from '@fortawesome/free-solid-svg-icons';

export default function Search(){
	let [searchResults, setSearchResults] = React.useState({communities: [], users: []});
	let searchRef = React.useRef(null);
	
	async function handleSearch(){
		if(searchRef.current.value.length < 3){
			setSearchResults({users: [], communities: []});
			return;
		}
		let res = await fetch(`https://socmed-server.vercel.app/api/search?search=${searchRef.current.value}`);
		let data = await res.json();
		setSearchResults(data);
	}

	function SearchElements(){
		let arr = [];
		if(searchResults.communities.length){
			arr.push(...searchResults.communities.map(obj => {
				return (
					<div className="search-element" onClick={() => {window.location.href = `/socmed/community?id=${obj.id}`}}>
						<FontAwesomeIcon icon={faTableColumns} className='search-element__icon'/>
						<div className="search-element__text">{obj.name}</div>
					</div>
				)
			}));
		}
		if(searchResults.users.length){
			arr.push(...searchResults.users.map(obj => {
				return (
					<div className="search-element" onClick={() => {window.location.href = `/socmed/profile?user=${obj.username}`}}>
						<FontAwesomeIcon icon={faUser} className='search-element__icon'/>
						<div className="search-element__text">{obj.username}</div>
					</div>
				)
			}));
		}
		return arr;
	}

	return (
		<div className="navbar__search">
			<div>
				<FontAwesomeIcon className="navbar__search-icon" icon={faMagnifyingGlass}/>
				<input type="text" className="navbar__search-bar input--style" id="search" onChange={handleSearch} ref={searchRef}/>
			</div>
			<div className="search-element__list">
				<SearchElements />
			</div>
		</div>
	)
}