module.exports = (data)=>{
	let manifest_data = JSON.stringify(data)
	return `(function(window){
				var data_names = ['manifest','polymer','bower','package']
				window.manifest = get_manifest(${manifest_data})
				
				
				function get_manifest(data){
					return new Proxy(data,{
						get(o,name){
							return get_manifest_value(name,o)
						},
						has(o,name){
							return has_manifest_value(name,o)
						}
					})
				}
				function get_manifest_value(name,data){
					switch(name){
						case 'icons':
							return data.manifest.icons
							break
					}
					if(name in data) return data[name]
					
					for(let i of data_names){
						if(i in data){
							let target = data[i]
							if(typeof target === 'object' && target !== null){
								if(name in target) return target[name]
							}
						}
					}
					return null
				}
				function has_manifest_value(name,data){
					switch(name){
						case 'icons':
							return 'icons' in data.manifest
							break
					}
					if(name in data) return true
					for(let i of data_names){
						if(i in data){
							let target = data[i]
							if(typeof target === 'object' && target !== null){
								if(name in target) return true
							}
						}
					}
					return false
				}
	})(window)`
}