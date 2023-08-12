import React from 'react';
import CommunityPreview from './CommunityPreview';
import ErrorPage from './ErrorPage';
import '../styles/home.css';

export default function Home(){
	let [communities, setCommunities] = React.useState();
	let [valid, setValid] = React.useState(false);

	function makePreviewList(arr){
		return arr.map(obj => (
			<CommunityPreview
				key={obj.id}
				id={obj.id}
				name={obj.name}
				banner={obj.banner}
				description={obj.description}
			/>
		));
	}

	React.useEffect(() => {
		const effect = async() => {
			let res = await fetch(`${import.meta.env.VITE_SERVER}/communities?view=home`, {
				credentials: 'include'
			});
			if(res.status == 200){
				let data = await res.json();
				setCommunities(data);
				setValid(true);
			}
		}
		effect();
	}, []);

	if(!valid){
		return <ErrorPage />;
	}

	return (
		<div className="home">
			<div className="home__communities-box" name="discover">
				<h1 className="home__heading">Discover</h1>
				<div className="home__preview-box">
					{makePreviewList(communities.discover)}
				</div>
			</div>
			{/* <div className="home__communities-box" name="popular">
				<h1 className="home__heading">Popular</h1>
				<div className="home__preview-box">
					{makePreviewList(communities.popular)}
				</div>
			</div>
			<div className="home__communities-box" name="recommended">
				<h1 className="home__heading">Recommended</h1>
				<div className="home__preview-box">
					{makePreviewList(communities.recommended)}
				</div>
			</div> */}
		</div>
	);
}
