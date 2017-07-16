
module.exports = function (app){
	return function has(name,target){
		if(typeof target !== 'undefined' && (target === null || typeof target !== 'object')) return false
		return target ? name in target:name in app
	}
}