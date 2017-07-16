const fxy = require('fxy')
const manifest = require('./manifest')
const tagger = require('./tagger')
const scripts = require('./scripts')
module.exports = (app)=>{
	const has = require('./has')(app)
	app = get_app(app)
	
	return `<!DOCTYPE html>
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
    <meta name="twitter:image" content="${app.image}"/>${get_google_verification()}${get_rss_feeds()}
    <link rel="shortlink" href="${app.shortlink || app.url}" />

    <!-- App Base -->
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

    <!-- App Icons -->
    ${get_icons()}
    <!-- Windows Tile (144x144 + tile color) -->
	${get_windows_tile()}
	<meta name="msapplication-TileColor" content="${app.theme_color || '#e12828'}">
	<meta name="msapplication-tap-highlight" content="no">
    
    <!-- Stylesheets -->
    ${get_google_fonts()}${get_stylesheets()}
    ${manifest(app)}
    <!-- Global Style -->
    ${get_style()}
    
  </head>
  <body>
    ${get_tag()}
    <noscript>
      ${app.title}
      Please enable JavaScript to view this website.
    </noscript>
	${scripts(app)}
  </body>
</html>
`;
	
	
	function get_app(app){
		if(!has('title')) app.title = 'Title'
		if(!has('language')) app.language = 'en'
		if(!has('locale')) app.locale = 'en_US'
		if(!has('type')) app.type = 'website'
		if(!has('name')) app.name = app.title
		if(!has('manifest')) app.manifest = {}
		if(!has('webapp')) app.webapp = {}
		return get_google(get_twitter(app))
	}
	
	function get_google(app){
		if(!has('google')) app.google = {}
		return app
	}
	
	function get_google_verification(){
		if(!has('google') || !has('site',app.google) || !has('verification',app.google.site)) return ''
		return `\n\t<meta name="google-site-verification" content="${app.google.site.verification}"/>`
	}
	function get_google_fonts(){
		if(!has('fonts',app.google)) return ''
		return `<link href="${app.google.fonts}" rel="stylesheet">`
	}
	
	function get_icons(){
		let tag = tagger('link',true,{rel:'apple-touch-icon'},['type','src'])
		let values = []
		if(has('icons')){
			let icons = app.icons
			if(Array.isArray(icons)){
				for (let icon of icons){
					let value = tag(Object.assign({href:icon.src},icon))
					if(value) values.push(value)
				}
			}
		}
		if(values.length) return `${values.join('\n\t')}`
		return ''
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
		return value.join('\n\t')
	}
	
	function get_style(){
		if(has('style')) return app.style
		return `<style>body{margin:0;background-color: ghostwhite;}</style>`
	}
	
	function get_stylesheets(){
		if(has('stylesheets')){
			const tag = tagger('link',true,{rel:"stylesheet"})
			let values = []
			let sheets = app.stylesheets
			for(let sheet of sheets){
				values.push(tag({href:sheet}))
			}
			return values.join('\n\t')
		}
		return ``
	}
	
	function get_tag(){
		if(!has('tag')) return `<h1>${app.title}</h1>`
		return `<${app.tag} id="app" dom-app></${app.tag}>`
	}
	
	function get_twitter(app){
		if(!has('twitter')) app.twitter = {}
		if(!has('card',app.twitter)) app.twitter.card = 'summary'
		return app
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
	
	//function has(name,target){
	//	if(typeof target !== 'undefined' && (target === null || typeof target !== 'object')) return false
	//	return target ? name in target:name in app
	//}
}


