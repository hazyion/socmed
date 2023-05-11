import React from "react";
import '../styles/modal.css';

export default function Modal(props){
	function handleClick(e){
		props.setModal(prev => ({...prev, visible: false}));
	}

	return (
		<div className="modal" onClick={handleClick}>
			<img src={props.src} alt=""/>
		</div>
	);
}