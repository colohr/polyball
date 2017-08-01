const fxy = require('fxy')

//exports
module.exports = get_data


//shared actions
function get_data(name,polyball){
	let filepath = `${name}.json`
	const path = fxy.join(polyball.folder,filepath)
	if(fxy.exists(path)) return require(path)
	return {}
}

