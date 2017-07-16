const fxy = require('fxy')
module.exports = function tagger(type,closed,defaults,skip){
	let open = `<${type} `
	let close = closed ? '':'>'
	let end = closed ? '>':`</${type}>`
	if(!Array.isArray(skip)) skip = []
	return function (data,content){
		if(!fxy.is.data(data)) return ''
		let attributes = []
		if(fxy.is.data(defaults)){
			for(let name in defaults){
				let value = defaults[name]
				if( !(name in data) ) {
					if(fxy.is.text(value)){
						let attribute = `${name}`
						if(value.length > 0) attribute += `="${value}"`
						attributes.push(attribute)
					}
				}
			}
		}
		for(let name in data){
			if(skip.includes(name) !== true) {
				let value = data[name]
				if(fxy.is.text(value)){
					let attribute = `${name}`
					if(value.length > 0) attribute += `="${value}"`
					attributes.push(attribute)
				}
			}
		}
		if(fxy.is.text(content) !== true) content = ''
		return `${open}${attributes.join(' ')}${close}${content}${end}`
	}
}