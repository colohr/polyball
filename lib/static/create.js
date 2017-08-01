
const fxy = require('fxy')
const html_template = require('./template/html')
const example_template = require('./template/example')
const scripts = require('./scripts')

module.exports = get_static_site

//shared actions
function get_static_site(folder,output){
	if(typeof output !== 'string') output = fxy.join(folder,'static.html')
	return new Promise((success,error)=>{
		let site = get_manifest()
		if(site instanceof Error) return error(site)
		return scripts().then(scripts=>{
			let html = example_template(site,scripts)
			
			return fxy.writeFile(output,html)
		}).catch(error)
	})
	
	
	//shared actions
	function get_manifest(){
		try{
			let manifest = require(fxy.join(folder,`manifest.json`))
			let polymap = require(fxy.join(folder,'polymer.json'))
			let app = require(fxy.join(folder,'app.json'))
			return app
		}
		catch(e){ return e }
	}
	
}