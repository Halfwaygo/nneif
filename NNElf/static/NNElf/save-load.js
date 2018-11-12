function saveJSON() {
	var json_str = JSON.stringify(layer_data);
	$.post('/save/', {'name':layer_data.name, 'json':json_str}, function(ret) {
		if (ret.message == 'success') {
			var aLink = document.createElement('a');
			var evt = document.createEvent('MouseEvents');
			evt.initEvent('click', false, false);
			var filename = layer_data.name + '.json';
			var blob = new Blob([json_str]);
			aLink.download = filename;
			aLink.href = URL.createObjectURL(blob);
			aLink.dispatchEvent(evt);
		}
	});
}

function loadFile(input) {
	if (input.files.length != 1) return;
	var extName = input.files[0].name.substr(input.files[0].name.indexOf('.')+1).toLowerCase();
	if (extName == 'json') {
		removeAll();
		var reader = new FileReader();
		reader.onload = (function() {
			layer_data = eval('(' + this.result + ')');
			repaintAll();
		});
		reader.readAsText(input.files[0]);
	}
}

function loadPreset(preset) {
	preset = preset.replace(/\s/g, '_');
	$.getJSON('/preset/', {name: preset}, function(ret) {
		removeAll();
  		layer_data = eval('(' + ret.data + ')');
  		repaintAll();
	});
}