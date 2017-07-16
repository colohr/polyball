const fxy = require('fxy')
const defaults = require('./template.json')
const tagger = require('./tagger')
module.exports = function get_app_scripts(app){
	const has = require('./has')(app)
	let modules = app.modules || 'modules'
	let scripts = defaults.scripts.map(filename=>fxy.join(modules,filename))
	let values = []
	if(has('scripts') && Array.isArray(app.scripts)) scripts = scripts.concat(app.scripts)
	let tag = tagger('script',false)
	for(let src of scripts) {
		let source = {src}
		if(src.includes('element')){
			source.async = true
			source.defer = true
		}
		values.push(tag(source))
	}
	return values.join('\n\t')
}