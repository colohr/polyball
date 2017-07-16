(function(window){
	
	const app_struct = Symbol('app struct')
	
	class Application{
		constructor(){
			this.element = window.document.querySelector('[dom-app]')
		}
		get location(){ return new URL(window.location) }
		get struct(){ return get_struct(this) }
		get url(){ return get_url(this) }
	}
	
	
	window.app = get_interface(new Application())
	
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
	
	function get_interface(application){
		return new Proxy(application,{
			get(o,name){
				let value = null
				switch(name){
					case 'pages':
						value = Array.from(o.element.query('#pages').querySelectorAll('*'))
						break
					case 'links':
						value = Array.from(o.element.query('#links').querySelectorAll('*'))
						break
					default:
						if(name in o) value = o[name]
						else if(name in o.element) {
							value = o.element[name]
							if(typeof value === 'function') value.bind(o.element)
						}
						break
				}
				return value
			},
			set(o,name,value){
				o[name] = value
				return true
			},
			has(o,name){
				if(o in name) return o[name]
				return false
			},
			deleteProperty(o,name){
				delete o[name]
				return true
			}
		})
	}
	
	function get_struct(application){
		return new Promise((success,error)=>{
			if(app_struct in application) return success(application[app_struct])
			return window.fetch(application.constructor.struct(application.location))
 		})
	}
	
})(window)