import React from 'react';
import CommunityPreview from './CommunityPreview';
import ErrorPage from './ErrorPage';
import '../styles/home.css';

export default React.memo(function Home(props){
	let [communities, setCommunities] = React.useState();
	let [valid, setValid] = React.useState(true);
	let [loading, setLoading] = React.useState(true);

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
			console.log(props.rerender);
			let res = await fetch(`${import.meta.env.VITE_SERVER}/communities?view=home`, {
				credentials: 'include'
			});
			if(res.status == 200){
				let data = await res.json();
				setCommunities(data);
				setValid(true);
			}
			else{
				setValid(false);
			}
			setLoading(false);
		}
		effect();
	}, []);

	if(!valid){
		return <ErrorPage />;
	}

	if(loading){
		return <ErrorPage loading />;
	}

	return (
		<div className="home">
			<div className="home__communities-box" name="discover">
				<h1 className="home__heading">Discover</h1>
				<div className="home__preview-box">
					{makePreviewList(communities.discover)}
				</div>
			</div>
			<div className="home__communities-box" name="popular">
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
			</div>
		</div>
	);
}, (prev, next) => prev === next);
