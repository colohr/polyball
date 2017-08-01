
const fxy = require('fxy')
const update = require('./update')

//exports
module.exports = get_polymer

//shared actions
function get_polymer(polyball){
	if('fragments' in  polyball.data.polymer) return polyball.data.polymer
	if('fragments' in polyball.data && fxy.is.text(polyball.data.fragments)){
		let files = get_polymer_files(polyball)
		if(fxy.is.data(polyball.data.polymer) === false){
			polyball.data.polymer = get_polymer_data(polyball,files)
		}
		polyball.data.polymer.sources = get_polymer_sources(polyball)
		update.polymer(polyball)
	}
	return polyball.data.polymer
}

function get_polymer_data(polyball,files){
	let app = polyball.app
	let shell = 'shell' in app ? app.shell:null
	if(!('tag' in app)) app.tag = fxy.id.dash(app.short_name)
	if(!shell && 'elements' in app) shell = fxy.join(app.elements,app.tag)
	return get_polymer_default_data(shell,files)
}

function get_polymer_default_data(shell,files){
	return {
		"entrypoint": "index.html",
		"shell": shell,
		"fragments": files,
		"extraDependencies": [
			"manifest.json",
			"bower_components/webcomponentsjs/*.js"
		],
		"lint": {
			"rules": ["polymer-2"]
		}
	}
}

function get_polymer_files(polyball){
	let path = fxy.join(polyball.folder,polyball.data.fragments)
	let files = []
	if(fxy.exists(path)){
		files = fxy.tree(path,'html').items.only.map(item=>{
			let name = item.name
			return fxy.join(polyball.data.fragments,name)
		})
	}
	return files
}

function get_polymer_sources(polyball){
	if(!('sources' in polyball.data.polymer)){
		let app = polyball.app
		return polyball.data.polymer.sources = [
			`${app.elements || 'custom-elements'}/**/*`,
			`${app.modules || 'modules'}/**/**`,
			`${app.graphics || 'graphics'}/**/*`,
			"bower.json"
		]
	}
	return polyball.data.polymer.sources
}



function read_polymers_old(polyball){
	if('fragments' in  polyball.data.polymer) return polyball.data.polymer
	if('fragments' in polyball.data && fxy.is.text(polyball.data.fragments)){
		let path = fxy.join(polyball.folder,polyball.data.fragments)
		if(fxy.exists(path)){
			let files = fxy.tree(path,'html').items.only
			if(files.length){
				files = files.map(item=>{
					let name = item.name
					return fxy.join(polyball.data.fragments,name)
				})
				
				if(fxy.is.data(polyball.data.polymer)){
					polyball.data.polymer.fragments = files
				}else{
					let app = polyball.app
					let shell = 'shell' in app ? app.shell:null
					if(!('tag' in app)) app.tag = fxy.id.dash(app.short_name)
					if(!shell && 'elements' in app) shell = fxy.join(app.elements,app.tag)
					
					polyball.data.polymer = {
						"entrypoint": "index.html",
						"shell": shell,
						"fragments": files,
						"extraDependencies": [
							"manifest.json",
							"bower_components/webcomponentsjs/*.js"
						],
						"lint": {
							"rules": ["polymer-2"]
						}
					}
					
					if(!('sources' in polyball.data.polymer)){
						polyball.data.polymer.sources = [
							`${app.elements || 'custom-elements'}/**/*`,
							`${app.modules || 'modules'}/**/**`,
							`${app.graphics || 'graphics'}/**/*`,
							"bower.json"
						]
					}
					
					
				}
				update_polymer(polyball)
			}
		}
	}
	return polyball.data.polymer
}


