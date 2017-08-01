const fxy = require('fxy')
module.exports.manifest = require('./manifest')
module.exports.lodash = get_file_export('lodash')
module.exports.fxy = get_file_export('fxy')
module.exports.element = get_file_export('element')

const babels = {
	get browser(){
		return ()=>{
			const babel = require('babel-core')
			let browser_file = get_file_export('browser')()
			return babel.transform(browser_file,{}).code
		}
	},
	get fxy(){
		return ()=>{
			const babel= require('babel-core')
			let fxy_file = get_file_export('fxy')()
			return babel.transform(fxy_file,{}).code
		}
	},
	get lodash(){
		return get_file_export('lodash')
	}
}

module.exports.babel = {
	names:['lodash','fxy','browser'],
	load(){
		return new Promise((success,error)=>{
			try{
				let scripts = this.names.map(name=>babels[name]())
				return success(`<script>${scripts.join('\n')}</script>`)
			}catch(e){
				return error(e)
			}
			
		})
	}
}

function get_file_export(name){
	let filepath = fxy.join(__dirname,'modules',`${name}.js`)
	let filevalue = fxy.readFileSync(filepath,'utf8')
	return function get_file(){
		return filevalue
	}
}