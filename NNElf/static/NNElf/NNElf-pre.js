function include(src) {
	document.write('<script src="static/NNElf/' + src + '"></script>');
}

var whitelist = new RegExp('[^a-z0-9_/-]');
var color = '#5e87b0';
var colorHover = '#4b739a';
var connType = 'Straight';
var instance = null;
var activeLayers = [];
var layer_def = {};
var subnet_def = {};
var layer_data = {};
layer_data['name'] = 'Untitled_Network';

$.getJSON('/define/', function(ret) {
	layer_def = eval('(' + ret.layer + ')');
	subnet_def = eval('(' + ret.subnet + ')');
});