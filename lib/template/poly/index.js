const fxy = require('fxy')
module.exports.manifest = require('./manifest')
module.exports.lodash = get_file_export('lodash')
//module.exports.app = get_file_export('app')
module.exports.fxy = get_file_export('fxy')
module.exports.element = get_file_export('element')

function get_file_export(name){
	let filepath = fxy.join(__dirname,'modules',`${name}.js`)
	let filevalue = fxy.readFileSync(filepath,'utf8')
	return function get_file(){
		return filevalue
	}
}