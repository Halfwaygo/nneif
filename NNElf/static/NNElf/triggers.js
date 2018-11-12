// edit the name of network
$("#network_name_editor").editable(function(value) {
	layer_data.name = value;
	return value;
}, {
	tooltip: 'click to edit',
	style: 'inherit',
	minwidth: 150,
	maxwidth: 990
});

// response to click on canvas
$('#canvas').click(function(e) {
	$.each(layer_data, function(id) {
		if (id == 'name') return true; // continue
		var layer = $('#' + id);
		if (layer.hasClass('active')) layer.removeClass('active');
	});
	activeLayers = [];
	noneActive();
});

// drag & drop
$('.drag-layer').on('dragstart', function(e) {
	e.originalEvent.dataTransfer.setData('id', e.target.id);
});

var drop_layer_param = {};
$('#canvas').on('drop', function(e) {
	var data = e.originalEvent.dataTransfer.getData('id');
	if(data == '') { return; }

	//e.preventDefault();
	if (data.substring(0,1) == 't') {
		drop_layer_param['cls'] = data.substring(5);
	}
	else {
		drop_layer_param['cls'] = 'subnet';
		drop_layer_param['name'] = data.substring(5);
	}
	drop_layer_param['posx'] = e.originalEvent.layerX;
	drop_layer_param['posy'] = e.originalEvent.layerY;
	drawTempLayer(drop_layer_param);
	$('#input-box').modal('show');
}).on('dragover', function(e) {
	e.preventDefault();
});

$('#input-submit').on('click', function() {
	var name = $('#input-name')[0].value;
	var uid = '';
	if (drop_layer_param.cls != 'subnet') {
		uid = initLayerData(name, drop_layer_param.cls);
	}
	else {
		uid = initSubnetData(name, drop_layer_param.name);
	}
	if (uid.length) {
		newLayer(uid, {x: drop_layer_param.posx, y: drop_layer_param.posy, drop: 1});
		$('#input-box').modal('hide');
	}
	else {
		var warning = $('#input-warning');
		warning.html('<i class="fa fa-times-circle"></i> Layer "' + name + '" already exist.');
		setInputState('error');
	}
});

$('#input-box').on('shown.bs.modal', function() {
	$('#input-name').focus();
}).on('hide.bs.modal', function() {
	$('#drop-temp-layer').remove();
}).on('hidden.bs.modal', function() {
	setInputState('default');
});