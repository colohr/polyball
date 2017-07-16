
const fxy = require('fxy')
const template = require('./template')

const script_folders = {
	modules:['poly']
}

const script_names = {
	modules:{
		poly:[
			'lodash',
			'fxy',
			'manifest',
			'element'
		]
	}
}

module.exports = function(polyball){
	//const logic = fxy.join(polyball.folder,polyball.data.modules || 'modules')
	return new Promise((success,error)=>{
		return create_folders(polyball).then(()=>create_scripts(polyball)).then(success).catch(error)
	})
}

function create_folder(polyball,name){
	const path = fxy.join(polyball.folder,polyball.data[name] || name)
	return new Promise((success,error)=>{
		if(fxy.exists(path) !== true) {
			return fxy.make_dir
			          .promise(path)
			          .then(success)
			          .catch(error)
		}
		return success()
	})
}

function create_folders(polyball){
	//const modules = fxy.join(polyball.folder,polyball.data.modules || 'modules')
	return new Promise((success,error)=>{
		let promises = []
		for(let folder in script_folders) promises.push(create_folder(polyball,folder))
		return Promise.all(promises).then(()=>{
			let inners = []
			for(let i in script_folders) {
				let list = script_folders[i]
				for(let name of list){
					let file_path = fxy.join(i,name)
					inners.push(create_folder(polyball,file_path))
				}
			}
			return Promise.all(inners).then(success)
		}).catch(error)
	})
}

function write_script(polyball,folder,folder_file,file_value){
	const modules = 'modules' in polyball.data ? polyball.data.modules:'modules'
	const filepath = fxy.join(modules,folder,`${folder_file}.js`)
	const path = fxy.join(polyball.folder,filepath)
	try{
		fxy.writeFileSync(path,file_value,'utf8')
		console.log(`Created script: ${path}`)
	}catch(e){
		console.error(e)
		return false
	}
	return true
}

function create_scripts(polyball){
	let saves = []
	for(let folder in script_names){
		for(let template_name in script_names[folder]){
			for(let template_file of script_names[folder][template_name]){
				let value = get_script(polyball,template_name,template_file)
				if(value){
					let saved = write_script(polyball,template_name,template_file,value)
					if(saved) saves.push(template_file)
				}
			}
		}
	}
	return saves
}

function get_script(polyball,template_name,template_file){
	if(template_name in template){
		if(template_file in template[template_name]){
			return template[template_name][template_file](polyball.data)
		}
	}
	return null
}


