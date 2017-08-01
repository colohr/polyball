(function(window){
	let skip_elements = ['script','style']
	let body = window.document.body
	
	let html = get_page()
	body.innerHTML = html
	
	
	//shared actions
	
	function get_page(){
		let main = get_container(body.querySelector('#app'))
		return main.outerHTML
	}
	
	function get_container(element){
		let container = get_element(element)
		if(!container) return null
		container.innerHTML = element.shadowRoot ? element.shadowRoot.innerHTML:element.innerHTML
		
		return filter_children(container)
	}
	
	function filter_children(element){
		let children = Array.from(element.children)
		let html = []
		for(let child of children){
			if(skip_elements.includes(child.localName) !== true){
				html.push(child.outerHTML)
			}
		}
		element.innerHTML = html.join('')
		return element
	}
	
	function get_element(target){
		let tag_name = target.localName
		if(skip_elements.includes(tag_name)) return null
		let tag = tag_name
		if(tag_name.includes('-')) tag = 'div'
		let style = window.getComputedStyle(target)
		let element = document.createElement(tag)
		element.innerHTML = target.shadowRoot ? target.shadowRoot.innerHTML:target.innerHTML
		// 		element.innerHTML = target.innerHTML
        element.setAttribute('style',style.cssText)
		return element
	}
	
	
	
})(window)