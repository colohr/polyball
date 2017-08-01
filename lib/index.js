
const fxy = require('fxy')
const Polyball = require('./Polyball')
const input = require('yargs').argv

//exports
module.exports = read_inputs(input)
module.exports.graphic = require('./dom/graphic')
module.exports.tagger = require('./dom/tagger')
module.exports.static = require('./static')

//shared actions
function read_inputs(input){
	if(input.folder){
		const ball = new Polyball(input)
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
	return Polyball
}




//const template = require('./template')
//const modules = require('./modules')
//const manifest_template = require('./manifest-template')

//class Polyball{
//	constructor(site){
//		if(site.folder){
//			const root = process.cwd()
//			this.folder = fxy.join(root,site.folder)
//			this.data = get_data('app',this)
//			this.data.manifest = get_data('manifest',this)
//			this.data.polymer = get_data('polymer',this)
//			this.data.bower = get_data('bower',this)
//			this.data.package = get_data('package',this)
//			if(!('tag' in this.data)){
//				if(fxy.is.data(this.data.manifest) && 'short_name' in this.data.manifest){
//					this.data.tag = fxy.id.dash(this.data.manifest.short_name)
//				}
//				if(!('tag' in this.data)) this.data.tag = this.data.name
//			}
//		}
//	}
//	get app(){ return get_app(this.data,this) }
//	create(){
//		return new Promise((success,error)=>{
//			let index = template(this.app)
//			return modules(this).then(()=>{
//				let entry = this.data.polymer.entrypoint
//				return fxy.writeFile(fxy.join(this.folder,entry),index,'utf8')
//			}).then(success).catch(error)
//		})
//	}
//	get valid(){ return 'folder' in this }
//
//}

