
const fxy = require('fxy')
const meta = require('./meta.json')
const data_names = meta.names
const args = require('yargs').argv
const template = require('./template')
const modules = require('./modules')
//const manifest_template = require('./manifest-template')

class Polyball{
	constructor(site){
		if(site.folder){
			const root = process.cwd()
			this.folder = fxy.join(root,site.folder)
			this.data = get_data('app',this)
			this.data.manifest = get_data('manifest',this)
			this.data.polymer = get_data('polymer',this)
			this.data.bower = get_data('bower',this)
			this.data.package = get_data('package',this)
			if(!('tag' in this.data)){
				if(fxy.is.data(this.data.manifest) && 'short_name' in this.data.manifest){
					this.data.tag = fxy.id.dash(this.data.manifest.short_name)
				}
				if(!('tag' in this.data)) this.data.tag = this.data.name
			}
		}
	}
	get app(){ return get_app(this.data,this) }
	create(){
		return new Promise((success,error)=>{
			let index = template(this.app)
			return modules(this).then(()=>{
				let entry = this.data.polymer.entrypoint
				return fxy.writeFile(fxy.join(this.folder,entry),index,'utf8')
			}).then(success).catch(error)
		})
	}
	get valid(){ return 'folder' in this }
	
}

if(args.folder){
	const ball = new Polyball(args)
	if(ball.valid){
		ball.create().then(()=>{
			console.log('ball created')
		}).catch((e)=>{
			console.log('ball error')
			console.error(e)
		})
	}
	else console.error('No folder for polyball site');
}


module.exports = Polyball
module.exports.graphic = require('./dom/graphic')
module.exports.tagger = require('./dom/tagger')
module.exports.static = require('./static')

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

function has_app_value(name,data,polyball){
	switch(name){
		case 'icons':
			return read_icons(polyball).length > 0
			break
	}
	if(name in data) return true
	for(let i of data_names){
		if(i in data){
			let target = data[i]
			if(fxy.is.data(target)){
				if(name in target) return true
			}
		}
	}
	return false
}

function get_data(name,polyball){
	let filepath = `${name}.json`
	const path = fxy.join(polyball.folder,filepath)
	if(fxy.exists(path)) return require(path)
	return {}
}

function read_icons(polyball){
	if('icons' in  polyball.data.manifest) return polyball.data.manifest.icons
	if('icons' in polyball.data && fxy.is.text(polyball.data.icons)){
		let path = fxy.join(polyball.folder,polyball.data.icons)
		if(fxy.exists(path)){
			let files = fxy.tree(path,'png','jpeg','jpg').items.only
			if(files.length){
				files = files.map(item=>{
					let name = item.name
					let ext = fxy.extname(name)
					name = name.replace(ext,'').trim()
					if(name){
						let sizes = name.split('-')[1].trim()
						let type = `image/${ext.replace('.','')}`
						return {
							src:fxy.join(polyball.data.icons,item.name),
							sizes,
							type
						}
					}
				})
				
				if(fxy.is.data(polyball.data.manifest)){
					polyball.data.manifest.icons = files
				}else{
					let app = polyball.app
					polyball.data.manifest = {
						"name": app.title || app.name,
						"short_name": app.short_name || app.name || app.title,
						"start_url": "./?homescreen=1",
						"display": "standalone",
						"theme_color": "#3b3e46",
						"background_color": "#3b3e46",
						icons
					}
				}
				update_manifest(polyball)
			}
		}
	}
	return polyball.data.manifest.icons
}

function read_polymers(polyball){
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

function update_manifest(polyball){
	let manifest = fxy.join(polyball.folder,'manifest.json')
	fxy.writeFileSync(manifest,JSON.stringify(polyball.data.manifest),'utf8')
	return console.log('updated manifest.json @ ',manifest)
}

function update_polymer(polyball){
	let polymer = fxy.join(polyball.folder,'polymer.json')
	fxy.writeFileSync(polymer,JSON.stringify(polyball.data.polymer),'utf8')
	return console.log('updated polymer.json @ ',polymer)
}