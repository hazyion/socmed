import React from "react";
import ReactLoading from 'react-loading';
import '../styles/errorpage.css';

export default function ErrorPage(props){
	let message = props.message || 'This page could not be found';

	return (
		<div className="error-page">
			{props.loading &&
			<ReactLoading
				height={'60px'}
				width={'60px'}
				className='loading'
				color='grey'
				type={'bubbles'}
			/>}
			{!props.loading && <div className="error">{message}</div>}
		</div>
	);
}
