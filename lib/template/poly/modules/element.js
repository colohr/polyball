window.addEventListener('WebComponentsReady', function() {
	
	class Application{
		static fetch(url,type = 'json'){
			return new Promise((success,error)=>{
				if(!url) return error(new Error(`Invalid url to fetch ${type} data ${url}${file ? ' file: '+file:''}`))
				return window.fetch(url).then(response=>response[type]()).then(success).catch(error)
			})
		}
		static html(path){
			let url = null
			if(typeof path === 'string' && path.includes('http') !== true) path = `${window.app.location.origin}/${path}`
			if(!is_url(path)) {
				if(path.includes('.html') !== true) path += '.html'
				url = new URL(path)
			}
			else url = path
			return this.fetch(url,'text')
		}
		static json(name_or_url,json_file){
			let url = null
			if(!is_url(name_or_url)){
				let json_data_folder = this.manifest(`${name_or_url}_json`)
				if(json_data_folder){
					let path = `${window.app.location.origin}/${json_data_folder}/${json_file}`
					if(path.includes('.json') !== true) path+='.json'
					url = new URL(path)
				}
			}
			else url = name_or_url
			return this.fetch(url)
		}
		
		static manifest(name){ return 'manifest' in window && name in window.manifest ? window.manifest[name]:null }
		constructor(){
			this.element = window.document.querySelector('[dom-app]')
			
		}
		get location(){ return new URL(window.location) }
		get struct(){ return get_struct(this) }
		get url(){ return get_url(this) }
		
	}
	
	var DomModuleMixins = new Map()
	
	class DomModule extends Polymer.Element{
		static get company(){ return get_properties(this.manifest.company) }
		static define(...x){
			if(x.length) return window.customElements.define(...x)
			return window.customElements.define(this.is,this)
		}
		static get get_properties(){ return get_properties }
		static get get_property(){ return get_property }
		static get html(){ return Application.html.bind(Application) }
		static get is(){ return fxy.id.dash(this.name) }
		static get json(){ return Application.json.bind(Application) }
		static port(url){
			return new Promise((success,error)=>{
				if(typeof url === 'string' && !url.includes('http')) url = `${window.app.location.origin}${url}`
				if(!is_url(url)) return error(new Error(`DomModule.port: invalid url`))
				return Polymer.importHref(url,(e)=>{
					return success(e)
				},(e)=>{
					return error(e)
				},true)
				
			})
		}
		static get manifest(){ return window.manifest }
		static get Mix(){ return get_dom_module_mix }
		static get mixin(){ return get_dom_module_mixin }
		
		all(selector){
			return Array.from(this.shadowRoot.querySelectorAll(selector))
		}
		query(selector){
			return this.shadowRoot.querySelector(selector)
		}
		slotted(query){
			if(typeof query !== 'string') query='slot'
			return new Proxy(get_slots(this,query),{
				get(o,name){
					if(name in o) return o[name]
					let matches = []
					for(let slotted of o){
						if(slotted.slot === name) matches.push(slotted)
						if(slotted.getAttribute('name') === name) matches.push(slotted)
						if(slotted.getAttribute('id') === name) matches.push(slotted)
						if(slotted.localName === fxy.id.dash(name)) matches.push(slotted)
					}
					return matches
				}
			})
		}
	}
	
	
	
	class DomPage extends DomModule{
		goto_section(id){
			let section = this.query(`#${id}`)
			if(section) {
				section.scrollIntoView()
				return true
			}
			return false
		}
	}
	
	class DomApp extends DomModule{
		static get start_page(){ return 'welcome' }
		static get properties(){
			return {
				page: {
					type: String,
					reflectToAttribute: true,
					observer: 'page_changed'
				},
				root_pattern:{
					type:String
				},
				route_data: Object,
				subroute: String
			}
		}
		static get observers() { return [ 'route_page(route_data.page)' ] }
		constructor(){
			super()
			this.root_pattern = (new URL(this.rootPath)).pathname
		}
		connect(){}
		
		get interface(){ return DomApp.interface }
		link_selector(e){
			let type = e.type
			let detail = e.detail
			let item = fxy.is.data(detail) ? detail.item:null
			if(!item) return
			console.log(item,type)
			switch(type){
				case 'iron-select':
					item.setAttribute('aria-selected','true')
					this.link_router(item)
					break
				case 'iron-deselect':
					item.setAttribute('aria-selected','false')
					break
			}
		}
		link_router(link){
			if(typeof this.link_timer === 'number'){
				window.clearTimeout(this.link_timer)
				delete this.link_timer
			}
			let section_name = link.getAttribute('name')
			let section_page = link.getAttribute('page')
			if(section_name && section_page){
				if(section_page === this.constructor.start_page){
					let section = window.app.query(`section#${section_name}`)
					if(section){
						this.link_timer = window.setTimeout(function(){
							section.scrollIntoView()
							delete this.link_timer
						},50)
					}
					
				}
				else{
					let opened = this.opened_page
					if(opened && 'goto_section' in opened) opened.goto_section(section_name)
				}
			}
		}
		
		get_link({name,hash,page}){
			let links = this.interface.links
			return links.filter(link=>{
				if(name && link.getAttribute('name') === name) return true
				else if(hash && link.getAttribute('href') === hash) return true
				else if(page && link.getAttribute('page') === page) return true
				return false
			})[0]
		}
		page_link_listener(e){
			let target_page = e.currentTarget.getAttribute('page')
			this.page = target_page
			if(target_page === 'welcome'){
				console.log({target_page})
				let section_name = e.currentTarget.getAttribute('name')
				let section = window.app.query(`section#${section_name}`)
				console.log({section})
				if(section) section.scrollIntoView()
				
			}
			else this.goto_section(e.currentTarget.getAttribute('name'))
		}
		goto_section(section){
			if(section){
				//let scrolled = false
				//let opened_page = this.opened_page
				//let link = this.get_link({page:opened_page})
				//if(link) this.link_router(link)
				
				//if(opened_page && 'goto_section' in opened_page){
				//	scrolled = this.opened_page.goto_section(section)
				//	if(!scrolled){
				//		let link = this.get_link({name:section})
				//		if(link) scrolled = opened_page.goto_section(section)
				//	}
				//}
				//if(!scrolled) window.location.hash = ''
			}
		}
		//goto_start(){
			//console.log('hello')
			//this.page = this.constructor.start_page
			//let button = this.query('[start-button]')
			//if(button) button.setAttribute('aria-selected','true')
		//}
		get opened_page(){
			let pages = this.query('[pages]')
			if(pages) return pages.selectedItem
			return null
		}
		get opened_page_link(){
			return this.interface.links.filter(link=>link.getAttribute('page')===this.page)[0]
		}
		ready(){
			super.ready()
			this.interface.links.container.addEventListener('iron-select',this.link_selector.bind(this))
			this.interface.links.container.addEventListener('iron-deselect',this.link_selector.bind(this))
			set_app_page_links(this.interface)
			this.page_did_load()
		}
		route_page(page) {
			if (page === undefined) return
			let link = this.opened_page_link
			if(link) link.setAttribute('aria-selected', 'false')
			this.page = page || this.constructor.start_page
			
			
			//if (this.page === this.constructor.start_page) this.query('[start-button]').setAttribute('aria-selected', 'true')
			//else this.query('[start-button]').setAttribute('aria-selected', 'false')
			//if (this.drawer && !this.drawer.persistent) this.$.drawer.close()
		}
		page_changed(page) {
			let page_element = this.query(`iron-pages [name="${page}"]`)
			if(page_element && page_element.hasAttribute('sections')) return this.page_did_load()
			let page_url = this.resolveUrl('pages/' + page + '-page' + '.html')
			Polymer.importHref(page_url, this.page_did_load.bind(this), this.show_not_found.bind(this), true)
		}
		page_did_load(){
			let section = window.app.url.section
			if(section){
				let link = this.get_link({name:section})
				if(link) this.link_router(link)
			}
		}
		show_not_found() {
			this.page = 'not-found'
		}
		
	}
	
	
	
	
	

	//exports
	DomApp.interface = get_interface(new Application())
	window.app = DomApp.interface
	window.DomApp = DomApp
	window.DomModule = DomModule
	window.DomPage = DomPage
	window.dispatchEvent(new CustomEvent('DomModule',{bubbles:true,composed:true}))
	
	//shared actions
	
	function get_app_content(element,selector,items_selector){
		let container = Symbol.for('items container')
		let items = element.all(`${items_selector}`)
		items[container] = element.query(`${selector}`)
		return new Proxy(items,{
			get(o,name){
				let value = null
				if(name === 'container') return o[container]
				if(name in o) {
					value = o[name]
					if(fxy.is.function(value)) value = value.bind(o)
				}
				else if(name in o[container]) {
					value =  o[container][name]
					if(fxy.is.function(value)) value = value.bind(o[container])
				}
				switch(name){
					case 'count':
						return o.length
				}
				return value
			},
			has(o,name){
				if(name in o) return true
				else if(name === 'container') return true
				else if(name in o[container]) return true
				return false
			}
		})
	}
	
	
	
	function get_dom_module_mix(...mixins){
		var Mix = get_dom_module_mix_data(...mixins)
		for(let name of mixins) {
			if(DomModuleMixins.has(name)){
				var item = DomModuleMixins.get(name)
				Mix.Base = item.mixin(Mix.Base)
				if(typeof item.properties === 'object' && item.properties !== null) {
					let mixin_properties = properties(Mix.Base.properties,item.properties)
					Object.assign(Mix.Base.properties,mixin_properties)
				}
			}
		}
		//value exportated
		return Mix.Base
		//shared actions
		function properties(base_properties,item_properties){
			let mixin_properties = {}
			for(let name in item_properties){
				let item_property = item_properties[name]
				mixin_properties[name] = !(name in base_properties) ? item_property : mix_property(base_properties[name],item_property)
			}
			return mixin_properties
		}
		
		function mix_property(base_property,item_property){
			let property = {}
			for(let name in item_property){
				if(name in base_property) property[name] = base_property[name]
				else property[name] = item_property[name]
			}
			for(let name in base_property){
				if(!(name in property)) property[name] = base_property[name]
			}
			return property
		}
	}
	
	function get_dom_module_mix_data(...mixins){
		var BaseExtends = mixins.filter(base=>typeof base === 'function')[0]
		var properties = mixins.filter(item=>typeof item === 'object' && item !== null)[0] || {}
		if(typeof BaseExtends !== 'function') BaseExtends = DomModule
		mixins = mixins.filter(name=>typeof name === 'string')
		var Base = class extends BaseExtends{}
		try{
			if('properties' in BaseExtends) Object.assign(properties,BaseExtends.properties)
			Base.properties = Object.assign({},properties)
		}catch(e){
			console.error('DomModule: cannot add properties for the Base mixin')
			console.error(e)
		}
		return {Base,mixins}
	}
	
	function get_dom_module_mixin(name,mixin,properties){
		if(DomModuleMixins.has(name) !== true && typeof mixin === 'function') DomModuleMixins.set(name,{mixin,properties})
		return DomModuleMixins.get(name)
	}
	
	function get_interface(application){
		return new Proxy(application,{
			deleteProperty(o,name){ return delete o[name] },
			get(o,name){
				let value = null
				switch(name){
					case 'pages':
					case 'links':
						let item_selector = name === 'pages' ? '[pages] > *':`app-header [page-link]`
						value = get_app_content(o.element,`[${name}]`,item_selector)
						break
					default:
						if(name in o) value = o[name]
						else if(name in o.element) {
							value = o.element[name]
							if(fxy.is.function(value)) value.bind(o.element)
						}
						else if(name in Application){
							value = Application[name]
							if(fxy.is.function(value)) value.bind(Application)
						}
						else if(name in DomApp){
							value = DomApp[name]
							if(fxy.is.function(value)) value.bind(DomApp)
						}
				}
				return value
			},
			has(o,name){ return name in o },
			set(o,name,value){
				o[name] = value
				return true
			}
			
		})
	}
	
	function get_properties(data,options){
		let properties = {}
		if(fxy.is.data(data)){
			for(let name in data){
				let property = get_property(data[name])
				if(property) properties[name] = property
				if(fxy.is.data(options)){
					if(property && name in options) properties[name] = Object.assign(properties[name],options[name])
					else if(name in options) properties[name] = options[name]
				}
			}
		}
		return properties
	}
	
	function get_property(value){
		let type = null
		if(fxy.is.number(value)) type = Number
		else if(fxy.is.array(value)) type = Array
		else if(fxy.is.text(value)) type = String
		else if(fxy.is.data(value)) type = Object
		else if(fxy.is.bool(value)) type = Boolean
		if(type) return {value,type}
		return null
	}
	
	function get_slot_nodes(slot){
		if('assignedNodes' in slot) return  Array.from(slot.assignedNodes()).filter(node=>node.nodeType !== Node.TEXT_NODE)
		return []
	}
	
	function get_slots(element,query){
		let nodes = []
		let slots = element.all(query)
		for(let slot of slots){
			let assigned_nodes = get_slot_nodes(slot)
			for(let node of assigned_nodes){
				if(!nodes.includes(node)) nodes.push(node)
			}
		}
		return nodes
	}
	
	function get_struct(application){
		return new Promise((success,error)=>{
			var app_struct = Symbol.for('app struct')
			if(app_struct in application) return success(application[app_struct])
			return window.fetch(application.constructor.struct(application.location))
		})
	}
	
	function get_url(application) {
		return new Proxy(application.location,{
			get(o,name){
				let value = null
				switch(name){
					case 'page':
						value = get_page_value(o.pathname)
						break
					case 'params':
						value = o.searchParams
						break
					case 'section':
						value = get_section_value(o.hash)
						break
					case 'of':
						value = get_valid_url(o)
						break
				}
				return value
			}
		})
		
		function get_page_value(path){
			return path.split('/').filter(part=>part.length>0) || ''
		}
		function get_section_value(hash){
			return hash.replace('#','').trim()
		}
		function get_valid_url(o){
			return function valid_url(...urls){
				let url = urls.length === 1 ? urls[0]:null
				if(url === null) url = get_valid_app_url(...urls)
				if(typeof url === 'string'){
					if(url.includes(o.origin)) return url
					else if(url.includes('http')) return url
					
				}
				return ''
			}
		}
		function get_valid_app_url(target,type){
			switch(type){
				case 'page':
					break
			}
		}
	}
	
	
	function set_app_page_links(element) {
		let start_page = element.start_page
		let link_container = element.links.container
		for (let page of element.pages) {
			if(is_valid_link(page)) add_page_link(get_page_link(page))
		}
		let links = element.menu_links
		
		if(Array.isArray(links)){
			for(let link of links){
				if(is_valid_link(link)) add_page_link(create_page_link(link))
			}
		}

		
		//shared actions
		function add_page_link(link){
			let before = null
			if('before' in link) before = link_container.querySelector(`[name="${link.before}"]`)
			if(before) link_container.insertBefore(link,before)
			else link_container.appendChild(link)
		}
		function create_page_link({before, label, name, section, page}) {
			let link = document.createElement('a')
			if(name) link.setAttribute('name',name)
			if(page) link.setAttribute('page',page)
			if(label) link.setAttribute('aria-label',label)
			if(before) link.before = before
			link.setAttribute('page-link','')
			link.setAttribute('aria-selected','false')
			let href = ''
			if(page && page !== start_page) href += `/${page}`
			if(section) href += `/#${name}`
			link.href = href
			link.innerHTML = label || name
			return link
		}
		function get_page_link(page){
			let name = page.getAttribute('name')
			let label = page.hasAttribute('label') ? page.getAttribute('label') : name.split('-').join(' ')
			return create_page_link({name,label,page:name})
		}
		function has_page_link(name){
			return element.links.filter(link => link.getAttribute('name') === name).length > 0
		}
		function is_valid_link(data){
			let name = null
			if(fxy.is.element(data) && data.hasAttribute('name') && !data.hasAttribute('not-in-menu')){
				name = data.getAttribute('name')
			}
			else if(fxy.is.data(data) && 'name' in data){
				name = data.name
			}
			return name && !has_page_link(name)
		}
		
	}
	
	function is_url(value){
		if(value instanceof URL) return true
		return typeof value === 'string' && value.includes('http')
	}
	
})






