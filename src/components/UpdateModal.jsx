import React from 'react';
import '../styles/updatemodal.css';

export default function UpdateModal(props){
	return (
		<div className="update-modal" color={props.color}>{props.message}</div>
	)
}
