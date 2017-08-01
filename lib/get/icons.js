const fxy = require('fxy')
const update = require('./update')
//exports
module.exports = get_icons
//shared actions
function get_icons(polyball){
	if('icons' in  polyball.data.manifest) return polyball.data.manifest.icons
	if('icons' in polyball.data && fxy.is.text(polyball.data.icons)){
		let files = get_icons_files(polyball)
		polyball = get_icons_manifest(polyball,files)
		update.manifest(polyball)
	}
	return polyball.data.manifest.icons
}

function get_icons_files(polyball){
	let path = fxy.join(polyball.folder,polyball.data.icons)
	let files = []
	if(fxy.exists(path)) {
		files = fxy.tree(path, 'png', 'jpeg', 'jpg')
		           .items.only.map(item => {
						let name = item.name
						let ext = fxy.extname(name)
						name = name.replace(ext, '').trim()
						if (name) {
							let sizes = name.split('-')[1].trim()
							let type = `image/${ext.replace('.', '')}`
							return {
								src: fxy.join(polyball.data.icons, item.name),
								sizes,
								type
							}
						}
					})
	}
	return files
}

function get_icons_manifest(polyball,files){
	if(fxy.is.data(polyball.data.manifest) === false){
		let app = polyball.app
		polyball.data.manifest = {
			"name": app.title || app.name,
			"short_name": app.short_name || app.name || app.title,
			"start_url": "./?homescreen=1",
			"display": "standalone",
			"theme_color": "#3b3e46",
			"background_color": "#3b3e46"
		}
	}
	polyball.data.manifest.icons = files
	return polyball
}



function read_icons(polyball){
	if('icons' in  polyball.data.manifest) return polyball.data.manifest.icons
	if('icons' in polyball.data && fxy.is.text(polyball.data.icons)){
		let path = fxy.join(polyball.folder,polyball.data.icons)
		if(fxy.exists(path)){
			let files = fxy.tree(path,'png','jpeg','jpg').items.only
			if(files.length){
				
				
				if(fxy.is.data(polyball.data.manifest)){
					polyball.data.manifest.icons = files
				}else{
					let app = polyball.app
					polyball.data.manifest = {
						"name": app.title || app.name,
						"short_name": app.short_name || app.name || app.title,
						"start_url": "./?homescreen=1",
						"display": "standalone",
						"theme_color": "#3b3e46",
						"background_color": "#3b3e46",
						icons
					}
				}
				update_manifest(polyball)
			}
		}
	}
	return polyball.data.manifest.icons
}