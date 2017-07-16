(function window_fxy(window){
	
	const added_symbols = Symbol.for('user added symbols')
	const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
	const modules = Symbol('world wide internet modules')
	const numbers = '0123456789'
	const FxyExternals = new Map()
	const Symbols = {
		[added_symbols]:{},
		disable:Symbol('disabled state'),
		dont_mix:Symbol('function is not a mixin'),
		enable:Symbol('enabled state'),
		'false':Symbol('false value'),
		nil:Symbol('nil value or null'),
		routes:Symbol.for('element routes'),
		'true':Symbol('true value'),
		uid:Symbol('uid value')
	}
	
	
	class FxyUID extends String{
		static generate(count = 5) {
			let id = alphabet.charAt(Math.floor(Math.random() * alphabet.length))
			let all = numbers+alphabet
			for (let i = 0; i < count-1; i++) {
				id += all.charAt(Math.floor(Math.random() * all.length))
			}
			return id
		}
		static generate_uid() {
			function s4() {
				return Math.floor((1 + Math.random()) * 0x10000)
				           .toString(16)
				           .substring(1);
			}
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
				s4() + '-' + s4() + s4() + s4();
		}
		static get_uid(object){
			if(!is_object(object)) return null
			if(is_object(object) && Symbols.uid in object) return object[Symbols.uid]
			let prefix
			let index
			if('uid_prefix' in object) prefix = object.uid_prefix
			else if('uid-prefix' in object) prefix = object['uid-prefix']
			else if(is_element(object) && object.hasAttribute('uid-prefix')) prefix = object.getAttribute('uid-prefix')
			if('uid_index' in object) index = object.uid_index
			else if('uid-index' in object) index = object['uid-index']
			else if(is_element(object) && object.hasAttribute('uid-index')) index = object.getAttribute('uid-index')
			return object[Symbols.uid] = new FxyUID(prefix,index).attribute(object)
		}
		static get Mix(){
			return Base => class extends Base{
				get fxy_uid(){ return FxyUID.get_uid(this) }
				get uid(){ return FxyUID.get_uid(this).valueOf() }
				set uid(value){
					if(value instanceof FxyUID) this[Symbols.uid] = value.attribute(this)
					else if(is_numeric(value)) this[Symbols.uid] = new FxyUID(null,value).attribute(this)
					else if(fxy.is.text(value)) this[Symbols.uid] = new FxyUID(value).attribute(this)
					return this[Symbols.uid]
				}
			}
		}
		constructor(prefix,index){
			let id = FxyUID.generate()
			super(id)
			prefix = is_text(prefix) ? prefix:null
			index = is_numeric(index) ? get_numeral(index).value:null
			this.context = {
				id,
				index,
				prefix
			}
		}
		attribute(element){
			if(is_element(element)){
				let prefix = this.prefix
				let index = this.index
				if(prefix) element.setAttribute('uid-prefix',prefix)
				else element.removeAttribute('uid-prefix')
				if(index) element.setAttribute('uid-index',index)
				else element.removeAttribute('uid-index')
				element.setAttribute('uid',this.valueOf())
			}
			return this
		}
		get id(){ return this.context.id }
		get index(){ return this.context.index !== null ? this.context.index:''}
		set index(value){
			value = is_numeric(value) ? get_numeral(value).value:null
			if(value) return this.context.index = value
			return this.context.index
		}
		get prefix(){ return this.context.prefix !== null ? this.context.prefix+'':'' }
		set prefix(value){
			value = is_text(value) ? value:null
			if(value) return this.context.prefix = value
			return this.context.prefix
		}
		get values(){
			let index = this.index
			let prefix = this.prefix
			let values = []
			if(prefix) values.push(prefix)
			values.push(this.context.id)
			if(index) values.push(index)
			return values
		}
		valueOf(){ return this.values.join('-') }
		toString(){ return this.valueOf() }
	}
	
	
	
	class Fxy extends Map{
		constructor(){
			super()
			this[modules] = new Map()
		}
		get define(){ return define_custom_element }
		get dot(){ return get_dot_notation }
		exports(folder,action){ return action(module_exports(folder),this) }
		get external(){ return get_external() }
		folder(path){
			if(!this.has(path)) this.set(path,new Map())
			return this.get(path)
		}
		join(...paths){
			return paths.map(path=>{
				if(typeof path !== 'string') return null
				path = path.trim()
				if(path.length <= 0) return null
				return path
			}).filter(path=>{
				return path !== null
			}).join('/')
		}
		get is(){
			return {
				array:is_array,
				bool:is_bool,
				data:is_data,
				element:is_element,
				element_data:is_element_data,
				error:is_error,
				function:is_function,
				instance:is_instance,
				json:is_json,
				map:is_map,
				nothing:is_nothing,
				number:is_number,
				numeric:is_numeric,
				object:is_object,
				set:is_set,
				string:is_string,
				symbol:is_symbol,
				text:is_text,
				TF:is_TF
			}
		}
		get id(){
			const lodash = window._
			return {
				get camel(){ return this.code },
				capital(){ throw new Error(`Capital changed to capitalize. Use fxy.ks.capitalize.`) },
				capitalize(value){ return is_text(value) ? lodash.capitalize(value):'' },
				code(value){ return is_text(value) ? lodash.camelCase(value):'' },
				dash(value){ return is_text(value) ? lodash.kebabCase(value):'' },
				dot_notation(value){ return this.words(value).join('.') },
				get dots(){ return this.dot_notation },
				get kebab(){return this.dash},
				path(value){ return this.words(value).join('/') },
				proper(value){ return this.words(value).map(word=>this.capitalize(word)).join(' ') },
				readable(value){ return this.words(value).join(' ') },
				get snake(){return this.underscore},
				underscore(value){ return is_text(value) ? lodash.snakeCase(value):'' },
				words(value){ return is_text(value) ? lodash.words(value):[] },
				get _(){ return this.underscore }
			}
		}
		module(paths){
			let folder
			if(!is_data(paths)) return null
			else if( 'path' in paths && 'name' in paths ){
				
				folder = this.has(paths.path) ?
					     this.folder(paths.path) : null
				
				return is_map(folder) &&
				       folder.has(paths.name) ?
					   folder.get(paths.name) : null
				
			}
			return null
		}
		get modules(){ return get_modules() }
		get numeral(){return get_numeral}
		paths(pathname){ return this[modules].get(pathname) }
		require(...paths){
			let pathname = this.join(...paths)
			return this.module( this.paths(pathname) )
		}
		save(path,name,value){
			let pathname = this.join(path,name)
			this[modules].set(pathname,{ path, name })
			return this.folder(path).set(name,value).get(name)
		}
		get selector(){ return get_element_selector }
		get symbols(){
			return new Proxy(Object.keys(Symbols),{
				get(o,name){
					if(name in Symbols) return Symbols[name]
					else if(name in Symbols[added_symbols]) return Symbols[added_symbols][name]
					else if(typeof name === 'string') return Symbol.for(name)
					return null
				},
				has(o,name){
					return name in Symbols || name in Symbols[added_symbols]
				},
				set(o,name,value){
					if(is_text(value)) {
						if(!is_symbol(value)) console.warn(`New Symbol ${name} = ${value} is not a symbol. It will change to the Symbol.for(${value})`)
						Symbols[added_symbols][name] = Symbol.for(value)
					}
					return true
				},
				deleteProperty(o,name){
					if(name in Symbols[added_symbols]) delete Symbols[added_symbols][name]
					return name
				}
			})
		}
		get tag(){ return tag_closure }
		get uid(){ return get_fxy_uid() }
		when(...names){ return when_element_is_defined(...names) }
	}
	
	const fxy = new Fxy()
	window.fxy = fxy;
	
	//----------shared actions-----------
	
	function get_array( array, map ){
		if(is_array(array)) {
			if(is_function(map)) array = array.map(map)
			else if(is_text(map) && map in get_array) array = array.map(get_array[map].map).filter(get_array[map].filter)
		}
		return array || []
	}
	get_array.empty_text = {
		filter:function filter_empty_text(text){ return is_text(text) },
		map:function map_empty_text(text){ return is_text(text) ? text.trim():null}
	}

	function define_custom_element(tag_name,custom_element){ return define_custom_element.action( tag_name, define_custom_element.define( tag_name, custom_element ) ) }
	define_custom_element.ability = function(tag_name){
		if('customElements' in window) return window.customElements
		return new Error(`Custom Elements is not supported in this browser so wwi cannot define ${tag_name || ''}.`)
	}
	//define_custom_element.able = 'customElements' in window
	define_custom_element.action =  function(tag_name,defined){
		return {
			tag_name,
			error:defined instanceof Error,
			get then(){ return define_custom_element.then(this.tag_name) }
		}
	}
	define_custom_element.then = function(tag_name){return function define_then(callback){
			return define_custom_element.when(tag_name).then(callback)
		}}
	define_custom_element.define = function(tag_name,custom_element){
		const custom_elements = define_custom_element.ability(tag_name)
		if(custom_elements instanceof Error) return custom_elements
		return define_custom_element.set(custom_elements,tag_name,custom_element)
	}
	define_custom_element.has = function(custom_elements,tag_name){
		let defined_element = custom_elements.get(tag_name)
		if( is_nothing(defined_element) ) return false
		return defined_element
	}
	define_custom_element.set = function(custom_elements,tag_name,custom_element){
		let defined_element = define_custom_element.has(custom_elements,tag_name)
		if(!defined_element) {
			custom_elements.define(tag_name,custom_element)
			return custom_element
		}
		return defined_element
	}
	define_custom_element.when = function(tag_name,custom_element){
		return new Promise((success,error)=>{
			const defined = define_custom_element.define(tag_name,custom_element)
			if(defined instanceof Error) return error(defined)
			return window.customElements.whenDefined(tag_name).then(()=>{ return success(defined) }).catch(error)
		})
	}
	
	function get_difference(original,value){
		if(is_string(original)){
			let difference = original.replace(`${value}`,'').trim()
			if(difference.length) return difference
		}
		return null
	}
	function get_dot_notation(x){
		return  {
			get container(){ return this.parts.slice( 0, this.count-1 ).join('.') },
			get count(){ return this.parts.length },
			origin:is_text(x) ? x:'',
			get parts(){ return 'particles' in this ? this.particles : this.particles = get_array( this.origin.split('.'), 'empty_text' ) },
			get selector(){ return this.parts.join('.') },
			get target(){ return this.parts[ this.count-1 ] },
			value(data){
				if(!is_data(data)) null
				try { return this.parts.reduce((o, i) => o[i], data) }
				catch (e) { return null }
			},
			toString(){ return this.origin },
			valueOf(){ return this.parts.join('.') }
		}
	}
	function get_element_selector(element){
		if(is_text(element)) return element
		else if(is_element(element)){
			let tag = element.localName
			let id = element.hasAttribute('id') ? `#${element.getAttribute('id')}`:''
			let classes = get_element_selector_classes(element)
			let attributes = get_element_selector_attributes(element)
			return `${tag}${id}${attributes}${classes}`
		}
		return null
	}
	get_element_selector.skips = new Set(['style', 'class', 'id', 'tabindex' ])
	Object.defineProperties(get_element_selector,{attributes:{get(){return get_element_selector_attributes}}, classes:{get(){return get_element_selector_classes}}})
	function get_element_selector_attributes(element){
		if(element.hasAttributes()){
			let list = []
			let a = element.attributes
			let count = a.length
			for(let i=0;i<count;i++){
				let item = a.item(i)
				if(item.value.length < 30 && get_element_selector_valid_attribute(item.name)){
					if(item.value === '') list.push(`[${item.name}]`)
					else list.push(`[${item.name}="${item.value}"]`)
				}
			}
			return list.join('')
		}
		return ''
	}
	function get_element_selector_classes(element){
		let list = element.hasAttribute('class') ? element.getAttribute('class').split(' '):null
		if(list) return list.map(name=>name.trim()).filter(name=>!name.length).map(name=>`.${name}`).join('')
		return ''
	}
	function get_element_selector_valid_attribute(name){
		if(!get_element_selector.skips.has(name)) return false
		return name.indexOf('data-') !== 0
	}
	function get_external(){ return new Proxy({},{ get(o,name){ return get_external_module_loader(name) } }) }
	function get_external_module_loader(folder){
		return function module_loader(module,name){
			
			let path = `${folder}/${module}/${name}`
			let loading_module = is_loading(path)
			let promise = new Promise(function(success,error) {
				if (!is_text(folder) || !is_text(module) || !is_text(name)) return error(new Error(`Invalid module path: ${path}`))
				Define((app,module_exports)=>{
					if(module_exports instanceof Error) return error(module_exports)
					//console.log({module_exports,name})
					return success(module_exports)
				},`wwi.modules.${module}.${name}`)
				
			})
			
			let has_module = !fxy.is.nothing(fxy.require(`${module}/${name}`))
			if(has_module || loading_module) return promise
			FxyExternals.set(path,true)
			load_module(folder, module, name).then(result => set_module(path,module,name,result)).catch(e=>set_module(path,module,name,e))
			return promise
			
		}
		//shared actions
		function set_module(path,module,name,module_result){
			if(module_result instanceof Error) console.error(module_result)
			return fxy.exports(module,(module_block,fxy)=>{
				let exports
				if(is_function(module_result) && module_result.name === 'external_module') exports = module_result(module_block,fxy)
				else exports = module_result
				//console.log({name,exports})
				if(fxy.is.nothing(exports) === false) module_block[name] = exports
				
				FxyExternals.delete(path)
			})
			
		}
		function load_module(folder,module,name){
			let module_url = window.url[folder](module,`${name}.es6`)
			console.log('loading module from: ',module_url)
			return window.fetch(module_url)
			             .then(response=>response.text())
			             .then(module_text=>eval(module_text))
		}
		
		function is_loading(path){ return FxyExternals.has(path) }
		
	}
	function get_fxy_uid(){
		return new Proxy(FxyUID,{
			get(o,name){
				if(name in o) return o[name]
				if(name === 'UID') return FxyUID
				if(is_numeric(name)) return new FxyUID(null,name)
				if(fxy.is.text(name)) return new FxyUID(name)
				return null
			}
		})
	}
	function get_modules(){
		return new Proxy({modules:fxy.keys()},{
			get(o,name){
				if(fxy.has(name)){
					return new Proxy({module:fxy.get(name)},{
						get(o,name){
							if(o.module.has(name)) return o.module.get(name)
							return null
						},
						has(o,name){ return o.module.has(name) }
					})
				}
				return null
			},
			has(o,name){ return fxy.has(name) }
		})
	}
	function get_numeral(x){
		let value
		let type = typeof x
		if(is_string(x)) value = parseFloat(x)
		else if(is_number(x)) value = x
		else value = NaN
		let unit = get_difference(x,value)
		return {
			unit,
			type,
			get valuable(){return is_number(this.value)},
			value,
			toString(){ return this.valueOf() },
			valueOf(){ return `${this.value}${this.unit || ''}` }
		}
	}
	
	
	
	function is_array(value){ return is_object(value) && Array.isArray(value) }
	function is_bool(value){return is_TF(value)}
	function is_data(value){ return is_object(value) && !is_array(value) && !is_error(value) }
	function is_element(value,type){ return is_instance( value, type || HTMLElement) } //for the site side of code
	function is_element_data(value){ return is_object(value) || is_json(value) }
	function is_error(value){ return is_object(value) && value instanceof Error }
	function is_function(value){ return typeof value === 'function' }
	function is_instance(value,type){ return is_object(value) && is_function(type) && value instanceof type }
	function is_json(value){ return is_text(value) && /^[\],:{}\s]*$/.test(value.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')) }
	function is_map(value){ return is_object(value) && value instanceof Map }
	function is_nothing(value){ return typeof value === 'undefined' || value === null || (typeof value === 'number' && isNaN(value)) }
	function is_number(value){ return typeof value === 'number' && !isNaN(value) && isFinite(value) }
	function is_numeric(value){ return get_numeral(value).valuable }
	function is_object(value){ return typeof value === 'object' && value !== null }
	function is_set(value){ return is_object(value) && value instanceof Set }
	function is_string(value){ return is_text(value)}
	function is_symbol(value){ return typeof value === 'symbol'}
	function is_text(value){ return typeof value === 'string' || (is_object(value) && value instanceof String)}
	function is_TF(value){return typeof value === 'boolean'}
	
	function module_exports(module_folder_path){
		const folder_path = module_folder_path
		const folder = fxy.folder(folder_path)
	
		//fxy.save(this.path,name,value)
		return new Proxy({
			//get folder(){ return fxy.folder(this.path) },
			//path:folder_path,
			//save(name,value){ return fxy.save(this.path,name,value) },
		},{
			get(o,name){
				let value = fxy.has(folder_path) ? fxy.get(folder_path).get(name):null
				if(name in o) return o[name]
				return value
			},
			set(o,path,value){
				if(typeof path === 'symbol') return false
				return fxy.save(folder_path,path,value)
				//return o.save(path,value)
			},
			has(o,name){
				return fxy.has(folder_path) && fxy.get(folder_path).has(name)
			}
		})
	}
	
	function tag_closure_value(key,data){
		let dot = get_dot_notation(key)
		var x = dot.value(data)
		if(!x){
			let container_dot = get_dot_notation(dot.container)
			if(container_dot){
				let container_value = container_dot.value(data)
				if(is_array(container_value)){
					let container_list = container_value.map(item=>{ return item[dot.target] })
					x = container_list.join('')
				}
			}
		}
		return x
	}
	function tag_closure(strings, ...keys) {
		return (function(...values) {
			var dict = values[values.length - 1] || {}
			var result = [strings[0]]
			keys.forEach(function(key, i) {
				var value = Number.isInteger(key) ? values[key] : tag_closure_value(key,dict)
				result.push(value, strings[i + 1])
			});
			return result.join('')
		});
	}
	
	
	function when_element_is_defined(...names){
		let whens = names.map(name=>window.customElements.whenDefined(name))
		return Promise.all(whens)
	}
	
	
	

})(window)


