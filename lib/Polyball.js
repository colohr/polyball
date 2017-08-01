const fxy = require('fxy')
const modules = require('./modules')
const template = require('./template')

const get_data = require('./get/data')
const get_app = require('./get/app')

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
	get static_app(){
		return require('./static')(this)
	}
}

module.exports = Polyball