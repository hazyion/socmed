import React from "react";
import ReactLoading from 'react-loading';
import '../styles/errorpage.css';

export default function ErrorPage(props){
	let message = props.message || 'This page could not be found';

	return (
		<div className="error-page">
			{props.loading &&
			<ReactLoading
				height={'100px'}
				width={'100px'}
				className='loading'
				color={'#828181'}
				type={'bubbles'}
			/>}
			{!props.loading && <div className="error">{message}</div>}
		</div>
	);
}