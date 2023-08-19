import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faUser, faTableColumns, faXmark } from '@fortawesome/free-solid-svg-icons';
import loadingIcon from '../../public/images/loading-icon.png';

export default function Search(){
	let [searchResults, setSearchResults] = React.useState({communities: [], users: []});
	let [loading, setLoading] = React.useState(false);
	let searchRef = React.useRef(null);
	
	async function handleSearch(){
		if(searchRef.current.value.length < 3){
			setSearchResults({users: [], communities: []});
			return;
		}
		setLoading(true);
		let res = await fetch(`${import.meta.env.VITE_SERVER}/search?search=${searchRef.current.value}`);
		let data = await res.json();
		setSearchResults(data);
		setLoading(false);
	}

	function SearchElements(){
		let arr = [];
		if(searchResults.communities.length){
			arr.push(...searchResults.communities.map(obj => {
				return (
					<div className="search-element" onClick={() => {window.location.href = `/community?id=${obj.id}`}}>
						<FontAwesomeIcon icon={faTableColumns} className='search-element__icon'/>
						<div className="search-element__text">{obj.name}</div>
					</div>
				)
			}));
		}
		if(searchResults.users.length){
			arr.push(...searchResults.users.map(obj => {
				return (
					<div className="search-element" onClick={() => {window.location.href = `/profile?user=${obj.username}`}}>
						<FontAwesomeIcon icon={faUser} className='search-element__icon'/>
						<div className="search-element__text">{obj.username}</div>
					</div>
				)
			}));
		}
		if(!searchResults.users.length && !searchResults.communities.length && searchRef.current && searchRef.current.value.length > 3){
			arr.push(
				<div className="search-element">
					<FontAwesomeIcon icon={faXmark} className='search-element__icon'/>
					<div className="search-element__text">No results found</div>
				</div>
			)
		}
		return arr;
	}

	return (
		<div className="navbar__search">
			<div>
				<FontAwesomeIcon className="navbar__search-icon" icon={faMagnifyingGlass}/>
				<input type="text" className="navbar__search-bar input--style" id="search" onChange={handleSearch} ref={searchRef}/>
				{loading && <img src={loadingIcon} alt="loading-icon" className='navbar__loading-icon' />}
			</div>
			<div className="search-element__list">
				<SearchElements />
			</div>
		</div>
	)
}
