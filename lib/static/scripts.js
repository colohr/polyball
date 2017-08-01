const babel = require('../template/poly').babel

//exports
module.exports = get_scripts

//shared actions
function get_scripts(){ return babel.load() }