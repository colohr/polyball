const fxy = require('fxy')
const manifest = require('../../template/manifest')
const tagger = require('../../template/tagger')


module.exports = (app,scripts)=>{
	const has = require('../../template/has')(app)
	app = get_app(app)
	
	return `<!DOCTYPE html>
<html lang="${app.language}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, minimum-scale=1, initial-scale=1, user-scalable=yes">
    <title>${app.title}</title>

    

    <!-- App Base -->
    <base href="${app.base || '/'}">
    <link rel="icon" href="${app.favicon || 'favicon.ico'}">

    <!-- Add to homescreen for Chrome on Android. Fallback for manifest.json -->
    <meta name="mobile-web-app-capable" content="no">
    <meta name="application-name" content="${app.name}">

    <!-- App Icons -->
   
	<meta name="msapplication-TileColor" content="${app.theme_color || '#e12828'}">
	<meta name="msapplication-tap-highlight" content="no">
    
    <!-- Stylesheets -->
    ${get_google_fonts()}${get_stylesheets()}
   
    <!-- Global Style -->
    ${get_style()}
    
  </head>
  <body style="background:rgb(2, 130, 255);font-family:sans-serif;">
    
    <noscript>
      ${app.title}
      Please enable JavaScript to view this website.
    </noscript>
    ${scripts}
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
		return app
		//return get_google(get_twitter(app))
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
	
}


