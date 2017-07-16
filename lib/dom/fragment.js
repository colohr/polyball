const jsdom = require('jsdom')
const {JSDOM} = jsdom

module.exports = get_fragment

function get_fragment(text){
	if(typeof text !== 'string') return null
	return JSDOM.fragment(text)
}