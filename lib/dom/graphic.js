const fragment = require('./fragment')
const fxy = require('fxy')
const size = require('./size')
const tagger = require('./tagger')

const Item = fxy.Item

const custom_tag = Symbol('custom html tag')
const img_attributes = Symbol('extra graphic img tag attributes')
const html = Symbol('html text value')
const size_value = Symbol('graphic size value')
const sizes_value = Symbol('graphic sizes value')


class Graphic{
	constructor(item,tag,index){
		this.item = item instanceof Item ? item:null
		this.tag = tag
		if(fxy.is.number(index)) this.index = index
	}
	get attributes() {
		let attributes
		if(img_attributes in this) attributes = this[img_attributes]
		else {
			attributes = Object.assign({},this.size || {})
			for(let name in attributes){
				attributes[name] = attributes[name]+'px'
			}
			attributes.name = this.name
		}
		if(!('src' in attributes)) attributes.src = this.item.content
		return attributes
	}
	data(root){
		let manifest = this.manifest(root)
		manifest.html = this.html
		manifest.name = this.name
		manifest.folder = this.folder
		manifest.size = this.size
		return manifest
	}
	dom(html){
		if(!fxy.is.text(html)) html = this.html
		return fxy.is.text(html) ? fragment(html):null
	}
	get extension(){ return fxy.extname(this.path) }
	get folder(){ return get_folder(this) }
	get html(){ return get_html(this) }
	set html(value){
		if(fxy.is.text(value)) this[html] = value
		return this[html]
	}
	get img(){
		let dom = this.dom()
		if(dom) return dom.querySelector(this.tag)
		return null
	}
	manifest(root){
		let value = {type:this.type}
		let sizes = this.sizes
		if(sizes) value.sizes = this.sizes
		let path = this.path
		if(fxy.is.text(path)){
			if(fxy.is.text(root)) path = path.replace(root,'')
			value.src = path
		}
		return value
	}
	get name(){ return get_name(this) }
	get path(){ return this.valid ? this.item.get('path'):'' }
	get size(){
		if(size_value in this) return this[size_value]
		return null
	}
	set size(data){
		if(fxy.is.data(data)){
			this[size_value] = data
		}
		return data
	}
	size_promise(){
		return new Promise((success)=>{
			return size(this.path).then(size=>{
				if(size instanceof Error) this.error = size
				else this.size = size
				return success(this)
			})
		})
	}
	get sizes(){
		if(sizes_value in this) return this[sizes_value]
		let size = this.size
		if(!size) return null
		return this[sizes_value] = `${size.width}x${size.height}`
	}
	set sizes(value){
		if(fxy.is.text(value)) this[sizes_value] = value
		return this[sizes_value]
	}
	get tag(){ return custom_tag in this ? this[custom_tag]:'img'}
	set tag(value){ return fxy.is.text(value) ? this[custom_tag] = value:null }
	get tag_attributes(){
		return img_attributes in this ? this[img_attributes]:null
	}
	set tag_attributes(value){
		if(fxy.id.data(value)) this[img_attributes] = value
		return this[img_attributes]
	}
	get type(){ return `image/${this.extension.replace('.','')}` }
	get valid(){ return this.item !== null }
	
}

module.exports = (...x)=>{return new Graphic(...x) }
module.exports.file = read_graphic_from_file
module.exports.folder = read_graphics_in_folder
module.exports.Graphic = Graphic

//shared actions
function get_html_(graphic){
	if(html in graphic) return this[html]
	let tag = graphic.tag
	if(graphic.valid){
		let size = graphic.size
		let html_value = ''
		if(fxy.is.data(size)){
			html_value += `<${tag} height="${size.height}" width="${size.width}" src="${graphic.item.content}">`
		}else{
			html_value += `<${tag} src="${graphic.item.content}">`
		}
		if(tag !== 'img') html_value += `</${tag}>`
		return this[html] = html_value
	}
	return `<${tag}>`
}
function get_html(graphic) {
	if (html in graphic) return this[html]
	let tag = graphic.tag === 'img' ? tagger(graphic.tag, true) : tagger(graphic.tag, false)
	let value
	if (graphic.valid) value = graphic[html] = tag(graphic.attributes)
	else value = tag({})
	return value
}

function get_folder(graphic){
	if(graphic.valid){
		let directory = fxy.dirname(graphic.path)
		let parts = directory.split('/')
		let folder =parts[parts.length-1]
		if(folder) return folder
	}
	return null
}
function get_name(graphic){
	if(graphic.valid){
		let name = fxy.basename(graphic.path).replace(graphic.extension,'')
		return fxy.id.dash(name)
	}
	return null
}

function read_graphic_from_file(path,index,did_load){
	if(fxy.exists(path)) return new Graphic(Item.read(path),index,did_load)
	return null
}

function read_graphics_in_folder(folder,tag,dont_promise){
	let items = fxy.tree(folder,...Item.types.graphic).items.only
	let graphics = items.map((item,index)=>new Graphic(item,tag,index))
	if(dont_promise !== true){
		let promises = graphics.map(graphic=>graphic.size_promise())
		return new Promise((success,error)=>{
			return Promise.all(promises).then(_=>success(graphics)).catch(error)
		})
		
	}
	return graphics
}


