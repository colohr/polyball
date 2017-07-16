
const fxy = require('fxy')
const size_types = ['png','jpg','jpeg','gif','svg']
const calipers = require('calipers')('png', 'jpeg', 'gif','svg')

module.exports = function get_size(path){
	return new Promise((success)=>{
		if(!fxy.is.text(path) || !fxy.exists(path)) return success(new Error(`Invalid graphic path to get size`))
		let extension = fxy.extname(path).replace('.','')
		if(size_types.includes(extension)) {
			return calipers.measure(path).then(({pages})=>{
				if(fxy.is.array(pages) && pages.length) return success(pages[0])
				return success({width:0,height:0})
			}).catch(e=>{
				return success(e)
			})
		}
		return success(new Error(`Invalid graphic type to get size. Only: ${size_types} supported`))
	})
}