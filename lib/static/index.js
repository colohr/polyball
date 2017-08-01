const fxy = require('fxy')
const StaticApp = require('./StaticApp')
const static_app = Symbol('static app')

//exports
module.exports = get_static

//shared actions
function get_static(polyball){
	if(static_app in polyball) return polyball[static_app]
	polyball[static_app] = new StaticApp(polyball)
}


