const fxy = require('fxy')
module.exports = (app)=>{
	app = get_app(app)
	
	return `<!doctype html>
			<html lang="${app.language}">
			  <head>
			    <meta charset="utf-8">
			    <meta name="viewport" content="width=device-width, minimum-scale=1, initial-scale=1, user-scalable=yes">
			    <title>${app.title}</title>
			
			
			    <meta name="description" content="${app.description}">
			    <link rel="canonical" href="${app.url}"/>
			    <meta property="og:locale" content="${app.locale}"/>
			    <meta property="og:type" content="${app.type}"/>
			    <meta property="og:title" content="${app.title}"/>
			    <meta property="og:description" content="${app.description}"/>
			    <meta property="og:url" content="${app.url}"/>
			    <meta property="og:site_name" content="${app.name}"/>
			    <meta property="og:image" content="${app.image}"/>
			    <meta name="twitter:card" content="${app.twitter.card}"/>
			    <meta name="twitter:description" content="${app.description}"/>
			    <meta name="twitter:title" content="${app.title}"/>
			    <meta name="twitter:image" content="${app.image}"/>
			    
			    ${get_google_verfication()}
			    ${get_rss_feeds()}
			
			    <link rel="shortlink" href="${app.shortlink || app.url}" />
			
			    <!--
			      If deploying to a non-root path, replace href="/" with the full path to the project root.
			      For example: href="/polymer-starter-kit/relative-path-example/"
			    -->
			    <base href="${app.base || '/'}">
			
			    <link rel="icon" href="${app.favicon || 'favicon.ico'}">
			
			    <!-- See https://goo.gl/OOhYW5 -->
			    <link rel="manifest" href="${app.manifest.path || 'manifest.json'}">
			
			    <!-- See https://goo.gl/qRE0vM -->
			    <meta name="theme-color" content="${app.manifest.theme_color || '#e12828'}">
			
			    <!-- Add to homescreen for Chrome on Android. Fallback for manifest.json -->
			    <meta name="mobile-web-app-capable" content="${app.webapp.capable || 'no'}">
			    <meta name="application-name" content="${app.manifest.name || app.name}">
			
			    <!-- Add to homescreen for Safari on iOS -->
			    <meta name="apple-mobile-web-app-capable" content="${app.webapp.capable || 'no'}">
			    <meta name="apple-mobile-web-app-status-bar-style" content="${app.webapp.bar || 'black-translucent'}">
			    <meta name="apple-mobile-web-app-title" content="${app.manifest.name || app.name}">
			
			    ${get_apple_icons()}
			    
			    <!-- Tile icon for Windows 8 (144x144 + tile color) -->
				${get_windows_tile()}
				<meta name="msapplication-TileColor" content="${app.theme_color || '#e12828'}">
				<meta name="msapplication-tap-highlight" content="no">
			    
			    <script>
				      // Register the base URL
				      const baseUrl = document.querySelector('base').href;
			
	                  // Load and register pre-caching Service Worker
	                  window.addEventListener('manifest',manifested,false);
		              window.import_app = function(){
		                  let link = document.createElement('link')
		                  link.rel = "import"
		                  link.href = "${app.shell}"
		                  document.head.appendChild(link)
		              }
				      if ('serviceWorker' in navigator) {
		                window.addEventListener('load', function() {
					        navigator.serviceWorker.register(baseUrl + 'service-worker.js');
				        });
		              }
				      function manifested(e){
                        e.detail.base_url = baseUrl
                        window.dispatchEvent(new CustomEvent('manifested',{bubbles:true,composed:true,detail:e.detail}))
                        window.removeEventListener('manifest',manifested,false);
		              }
		
			    </script>
			
			    <!-- Load webcomponents-loader.js to check and load any polyfills your browser needs -->
			    <script src="bower_components/webcomponentsjs/webcomponents-loader.js"></script>
			
			    <!-- Fonts -->
			    ${get_google_fonts()}
			    <!-- App Shell -->
			    ${get_app_import()}
			    <!-- Global Style -->
			    ${get_app_style()}
			    
			  </head>
			  <body>
			    ${get_app_tag()}
			    <noscript>
			      ${app.title}
			      Please enable JavaScript to view this website.
			    </noscript>
				${get_app_scripts()}
			  </body>
			</html>
			`;
	
	
	function get_app_import(){
		let polymers = app.polymers
		if(has('import') || has('shell',polymers)){
			let href = has('import') ? app.import:polymers.shell
			return `<link rel="import" href="bower_components/polymer/polymer-element.html">`
		}
		return ''
	}
	
	function get_app_scripts(){
		let scripts = ['logic/manifest.js']
		let values = []
		if(has('scripts') && Array.isArray(app.scripts)) scripts = scripts.concat(app.scripts)
		let tag = tagger('script',false)
		for(let src of scripts) {
			if(scripts.indexOf(src) === scripts.length-1){
				values.push(tag({src,onload:'import_app(event)'}))
			}
			else values.push(tag({src}))
		}
		return values.join('\n')
	}
	
	function get_app_style(){
		if(has('style')) return app.style
		return `<style>body{margin:0;background-color: ghostwhite;}</style>`
	}
	
	function get_app_tag(){
		if(!has('tag')) return `<h1>${app.title}</h1>`
		return `<${app.tag} id="app" dom-app></${app.tag}>`
	}
	
	
	function get_google_verfication(){
		if(!has('google') || !has('site',app.google) || !has('verification',app.google.site)) return ''
		return `<!--google verification-->
			    <meta name="google-site-verification" content="${app.google.site.verification}"/>`
	}
	function get_google_fonts(){
		if(!has('fonts',app.google)) return ''
		return `<link href="${app.google.fonts}" rel="stylesheet">`
	}
	function get_rss_feeds(){
		let value = []
		if(has('rss')){
			if(typeof app.rss === 'object' && app.rss !== null){
				let rss = Array.isArray(app.rss) ? app.rss:[app.rss]
				for (let feed of rss){
					if(fxy.is.data(feed) && has('title',feed) && has('url',feed)){
						value.push(`<link rel="alternate" type="application/rss+xml" title="${feed.title}" href="${feed.url}"/>`)
					}
				}
			}
		}
		return value.join('\n')
	}
	function get_apple_icons(){
		let tag = tagger('link',true,{rel:'apple-touch-icon'},'type')
		let values = []
		if(has('icons')){
			let icons = app.icons
			if(Array.isArray(icons)){
				for (let icon of icons){
					let value = tag(icon)
					if(value) values.push(value)
				}
			}
		}
		if(values.length){
			return `<!--Apple App Icons -->
					${values.join('\n')}`
		}
		return ''
	}
	
	function get_windows_tile(){
		if(has('icons')){
			let icons = app.icons
			let tile = icons.filter(icon=>icon.sizes === '144x144')[0]
			if(tile){
				return `<meta name="msapplication-TileImage" content="${tile.src}">`
			}
		}
		return ''
	}
	
	function tagger(type,closed,defaults,skip){
		let open = `<${type} `
		let close = closed ? '':'>'
		let end = closed ? '>':`</${type}>`
		if(!Array.isArray(skip)) skip = []
		return function (data,content){
			if(!fxy.is.data(data)) return ''
			let attributes = []
			if(fxy.is.data(defaults)){
				for(let name in defaults){
					let value = defaults[name]
					if( !(name in data) ) {
						if(fxy.is.text(value)){
							let attribute = `${name}`
							if(value.length > 0) attribute += `="${value}"`
							attributes.push(attribute)
						}
					}
				}
			}
			for(let name in data){
				if(skip.includes(name) !== true) {
					let value = data[name]
					if(fxy.is.text(value)){
						let attribute = `${name}`
						if(value.length > 0) attribute += `="${value}"`
						attributes.push(attribute)
					}
				}
			}
			if(fxy.is.text(content) !== true) content = ''
			return `${open}${attributes.join(' ')}${close}${content}${end}`
		}
	}
	
	function get_app(app){
		if(!has('title')) app.title = 'Title'
		if(!has('language')) app.language = 'en'
		if(!has('locale')) app.locale = 'en_US'
		if(!has('type')) app.type = 'website'
		if(!has('name')) app.name = app.title
		if(!has('manifest')) app.manifest = {}
		if(!has('webapp')) app.webapp = {}
		get_app_twitter(app)
		get_app_google(app)
		return app
	}
	

	function get_app_google(app){
		if(!has('google')) app.google = {}
		return app
	}
	function get_app_twitter(app){
		if(!has('twitter')) app.twitter = {}
		if(!has('card',app.twitter)) app.twitter.card = 'summary'
		return app
	}
	function has(name,target){
		if(typeof target !== 'undefined' && (target === null || typeof target !== 'object')) return false
		return target ? name in target:name in app
	}
}


