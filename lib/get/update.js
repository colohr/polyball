
const fxy = require('fxy')

//exports
module.exports.manifest = update_manifest
module.exports.polymer = update_polymer

//shared actions
function update_manifest(polyball){
	let manifest = fxy.join(polyball.folder,'manifest.json')
	fxy.writeFileSync(manifest,JSON.stringify(polyball.data.manifest),'utf8')
	return console.log('updated manifest.json @ ',manifest)
}

function update_polymer(polyball){
	let polymer = fxy.join(polyball.folder,'polymer.json')
	fxy.writeFileSync(polymer,JSON.stringify(polyball.data.polymer),'utf8')
	return console.log('updated polymer.json @ ',polymer)
}