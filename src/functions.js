import cookies from 'js-cookie';

export async function getUsername(){
	if(cookies.get('token')){
		console.log(cookies.get('token'));
		let res = await fetch(`${import.meta.env.VITE_SERVER}/user`, {
			method: 'GET',
			mode: 'cors',
			credentials: 'include'
		});
		if(res.status == 200){
			let data = await res.json();
			return {username: data.username};
		}
		else{
			return {error: true, verification: false, message: "Token verification failed"};
		}
	}
	else{
		return {error: true, cookie: false, message: "Invalid cookies"};
	}
}

export function chatTime(date){
	let monthLookup = {
		0 : 'Jan',
		1 : 'Feb',
		2 : 'Mar',
		3 : 'Apr',
		4 : 'May',
		5 : 'Jun',
		6 : 'Jul',
		7 : 'Aug',
		8 : 'Sep',
		9 : 'Oct',
		10 : 'Nov',
		11 : 'Dec'
	};
	let cur = new Date(), final = '', time = '';
	let hours = date.getHours(), minutes = date.getMinutes();
	if(minutes < 10){
		minutes = '0' + minutes;
	}
	if(hours >= 12){
		hours = hours % 12;
		if(hours === 0){
			hours = 12;
		}
		time = hours + ':' + minutes + ' PM';
	}
	else{
		if(hours === 0){
			hours = 12;
		}
		time = hours + ':' + minutes + ' AM';
	}

	if(cur.getFullYear() === date.getFullYear()){
		if(cur.getMonth() === date.getMonth()){
			if(cur.getDate() === date.getDate()){
				final = time;
			}
			else if(cur.getDate() - 1 === date.getDate()){
				final = 'Yesterday ' + time; 
			}
			else{
				final = date.getDate() + ' ' + monthLookup[date.getMonth()] + ' ' + time;
			}
		}
		else{
			final = date.getDate() + ' ' + monthLookup[date.getMonth()] + ' ' + time;
		}
	}
	else{
		final = date.getDate() + ' ' + monthLookup[date.getMonth()] + ' ' + (date.getFullYear() % 100) + ' ' + time;
	}
	return final;
}
