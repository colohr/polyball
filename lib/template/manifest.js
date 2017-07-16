module.exports = function (app) {
	const has = require('./has')(app)
	return `
	<!-- App Scripts -->
	${base(app).trim()}
	${scripts(app)}
	${application(app)}`;
	function application(app) {
		let polymers = app.polymers
		if (has('import') || has('shell', polymers)) {
			let href = has('import') ? app.import : polymers.shell
			return `<!--Polymer-->
	<link rel="import" href="bower_components/polymer/polymer-element.html">`;
		}
		return ''
	}
	
	function base(app) {
		return `
	<script>
		'use strict';
		// Register the base URL
		var baseUrl = document.querySelector('base').href;
		
		window.addEventListener('DomModule', function() {
			window.manifest.base_url = baseUrl
		    // At this point we are guaranteed that all required polyfills have loaded,
		    // all HTML imports have loaded, and all defined custom elements have upgraded
		    let link = document.createElement('link')
		    link.rel = "import"
		    link.href = "${app.shell}"
		    document.head.appendChild(link)
		  });
	
		if ('serviceWorker' in navigator) {
			window.addEventListener('load', function() {
			    navigator.serviceWorker.register(baseUrl + 'service-worker.js');
			});
		}
	</script>`;
	}
	
	function scripts(app) {
		return `<!-- WecComponents Polyfill -->
	<script src="bower_components/webcomponentsjs/webcomponents-loader.js"></script>`
	}
}



