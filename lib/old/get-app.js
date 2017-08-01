
const fxy = require('fxy')

module.exports = get_app
//shared actions
function get_app(data,polyball){
	return new Proxy(data,{
		get(o,name){
			return get_app_value(name,o,polyball)
		},
		has(o,name){
			return has_app_value(name,o,polyball)
		},
		set(o,name,value){
			o[name] = value
			return true
		}
	})
}

function get_app_value(name,data,polyball){
	switch(name){
		case 'icons':
			return read_icons(polyball)
			break
		case 'polymers':
			return read_polymers(polyball)
			break
	}
	if(name in data) return data[name]
	
	for(let i of data_names){
		if(i in data){
			let target = data[i]
			if(fxy.is.data(target)){
				if(name in target) return target[name]
			}
		}
	}
	return null
}





