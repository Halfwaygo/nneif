//////////////// TreeView
var DataSourceTree = function(options) {
	this._data 	= options.data;
}
DataSourceTree.prototype.data = function(options, callback) {
	var self = this;
	var $data = null;

	if(!('name' in options) && !('type' in options)){
		$data = this._data; // the root tree
		callback({ data: $data });
		return;
	}
	else if('type' in options && options.type == 'folder') {
		if('children' in options)
			$data = options.children;
		else $data = {} // no data
	}
	
	if($data != null) { callback({ data: $data }); }
};

function tree_node(layer, folder, param) {
	var tree = $('#' + layer + '-tree');
	if (param == '') {
		return tree.find('.tree-folder[folder="' + folder + '"]');
	}
	else {
		return tree.find('.tree-item[folder="' + folder + '"][param="' + param + '"]');
	}
}

function handleDisplay(layer, folder, param) {
	var $list = null;
	if (folder == '') { $list = layer_data[layer].param; }
	else { $list = layer_data[layer].param[folder].param; }
	$.each($list, function(key) {
		if (this.display) {
			$.each(this.display, function(dkey) {
				if (dkey != param) return true;
				var show = false;
				for (var i=this.length-1; i>=0; i--) {
					if (this[i] == $list[param].value) {
						show = true;
						break;
					}
				}
				if (show) {
					if ($list[key].type == 'grp') { tree_node(layer, key, '').css('display', 'block'); }
					else { tree_node(layer, folder, key).css('display', 'block'); }
				}
				else {
					if ($list[key].type == 'grp') { tree_node(layer, key, '').css('display', 'none'); }
					else { tree_node(layer, folder, key).css('display', 'none'); }
				}
			});
		}
	});
}

function handleSelectItem(layer, folder, param) {
	var item = tree_node(layer, folder, param);
	if (item.length != 1) { return; }
	var $data = null;
	if (folder == '') { $data = layer_data[layer].param[param]; }
	else { $data = layer_data[layer].param[folder].param[param]; }

	// update the data
	$data.enabled = true;
	if ($data.required == -1) { $data.required = 1; }
	if (param == 'phase' && $data.value == 'ALL') {
		$data.value = 'TRAIN';
		drawLayer(layer);
	}

	// update the value display
	if (!item.hasClass('tree-selected')) {
		item.addClass('tree-selected');
		item.children('i').removeClass('fa-times').addClass('fa-check');
	}
	var name = item.children('.tree-item-name');
	name.children().remove();
	name.html(param + ': <b style="display:inline" editing="false">' + $data.value + '</b>');

	// set the editor
	var edit_param = {
		tooltip: 'click to edit',
		style: 'inherit',
		minwidth: 50,
		maxwidth: 200
	};
	if ($data.type == 'enum') {
		edit_param['data'] = {};
		for (var i=0; i<$data.enum.length; i++) { edit_param.data[$data.enum[i]] = $data.enum[i]; }
		edit_param.data['selected'] = $data.value;
		edit_param['type'] = 'select';
		edit_param['submit'] = 'OK';
	}

	if (param == 'name' && folder == '') {
		name.children('b').editable(function(value) {
			var val = value.toLowerCase();
			if (!whitelist.test(val)) { editLayerName(layer, val); }
			return $data.value;
		}, edit_param);
	}
	else if (param=='phase' && folder == '') {
		name.children('b').editable(function(value) {
			if (value != $data.value) {
				togglePhase(layer, true);
				edit_param.data['selected'] = value;
				handleDisplay(layer, folder, param);
			}
			return value;
		}, edit_param);
	}
	else if ($data.type == 'int') {
		name.children('b').editable(function(value) {
			var val = parseInt(value);
			if (!isNaN(val)) { $data.value = val; }
			return $data.value;
		}, edit_param);
	}
	else if ($data.type == 'flt') {
		name.children('b').editable(function(value) {
			var val = parseFloat(value);
			if (!isNaN(val)) { $data.value = val; }
			return $data.value;
		}, edit_param);
	}
	else if ($data.type == 'str') {
		name.children('b').editable(function(value) {
			$data.value = value;
			return value;
		}, edit_param);
	}
	else if ($data.type == 'enum') {
		name.children('b').editable(function(value) {
			$data.value = value;
			edit_param.data['selected'] = value;
			handleDisplay(layer, folder, param);
			return value;
		}, edit_param);
	}
}

function handleDeselectItem(layer, folder, param) {
	var item = tree_node(layer, folder, param);
	if (item.length != 1) { return; }
	var $data = null;
	if (folder == '') { $data = layer_data[layer].param[param]; }
	else { $data = layer_data[layer].param[folder].param[param]; }

	// update the data
	$data.enabled = false;
	if ($data.required == 1) { $data.required = -1; }
	$data.value = $data.default;
	if (param == 'phase') { drawLayer(layer); }
	if ($data.type == 'enum') { handleDisplay(layer, folder, param); }

	// update the value display
	if (item.hasClass('tree-selected')) {
		item.removeClass('tree-selected');
		item.children('i').removeClass('fa-check').addClass('fa-times');
	}
	var name = item.children('.tree-item-name');
	name.children().remove();
	name.html(param + ' (default: ' + $data.default + ')');
}

function showLayerData(id) {
	// generate accordion panels
	var accord = $('#layer-config-accordion');
	if (!accord.length) {
		accord = $('<div class="panel-group" id="layer-config-accordion"></div>');
		$('#layer-config-content').children().remove();
		$('#layer-config-content').css('padding', 0);
		$('#layer-config-content').append(accord);
	}

	var panel_html = [
	                  '<div class="panel panel-default" style="width:100%">',
	                  	'<div class="panel-heading"><h3 class="panel-title">',
	                  		'<a href="javascript:;" class="accordion-toggle" data-parent="#layer-config-accordion" data-toggle="collapse"',
	                  		' data-target="#' + id + '-panel">' + layer_data[id].cls + ' Layer: ' + layer_data[id].param.name.value,
	                  		'<div class="tools"></div></a>',
	                  	'</h3></div>',
	                  	'<div id="' + id + '-panel" class="panel-collapse collapse">',
	                  		'<div class="panel-body">',
	                  			'<div id="' + id + '-tree" class="tree"></div>',
	                  		'</div>',
	                  	'</div>',
	                  '</div>'
	                  ].join('');
	var panel = $(panel_html);
	panel.children('.collapse').children('.panel-body').css('padding-top', 0).css('padding-bottom', 0);
	accord.append(panel);
	if (!layer_data[id].inplace_parent.length && !layer_data[id].inplace_child.length) { $('#'+id+'-panel').addClass('in'); }

	// setup panel tools
	var ipid = layer_data[id].inplace_parent;
	if (layer_data[id].type == 'inplace') {
		if (ipid == '') {
			if (layer_data[id].parent.length == 1 && layer_data[layer_data[id].parent[0]].child.length == 1 && !layer_data[layer_data[id].parent[0]].param.phase) {
				var tool = $('<i class="fa fa-sign-in"></i>');
				panel.find('.tools').append(tool);
				tool.click(function (e) {
					signinLayer(id);
					var e = window.event || e;
			  		if (e.stopPropagation) e.stopPropagation();
			  		else e.cancelBubble = true;
				});
			}
		}
		else {
			if (layer_data[ipid].type != 'subnet') {
				if (id != layer_data[ipid].inplace_child[0]) {
					var tool = $('<i class="fa fa-angle-double-up"></i>');
					panel.find('.tools').append(tool);
					tool.click(function (e) {
						for (var i=layer_data[ipid].inplace_child.length-1; i>=0; i--) {
							if (layer_data[ipid].inplace_child[i] == id) {
								layer_data[ipid].inplace_child[i] = layer_data[ipid].inplace_child[i-1];
								layer_data[ipid].inplace_child[i-1] = id;
								drawLayer(ipid);
								ActiveLayer(ipid, true);
								break;
							}
						}
						var e = window.event || e;
				  		if (e.stopPropagation) e.stopPropagation();
				  		else e.cancelBubble = true;
					});
				}
				if (id != layer_data[ipid].inplace_child[layer_data[ipid].inplace_child.length-1]) {
					var tool = $('<i class="fa fa-angle-double-down"></i>');
					panel.find('.tools').append(tool);
					tool.click(function (e) {
						for (var i=layer_data[ipid].inplace_child.length-1; i>=0; i--) {
							if (layer_data[ipid].inplace_child[i] == id) {
								layer_data[ipid].inplace_child[i] = layer_data[ipid].inplace_child[i+1];
								layer_data[ipid].inplace_child[i+1] = id;
								drawLayer(ipid);
								ActiveLayer(ipid, true);
								break;
							}
						}
						var e = window.event || e;
				  		if (e.stopPropagation) e.stopPropagation();
				  		else e.cancelBubble = true;
					});
				}
				var tool = $('<i class="fa fa-share-square-o"></i>');
				panel.find('.tools').append(tool);
				tool.click(function (e) {
					signoutLayer(id);
					var e = window.event || e;
			  		if (e.stopPropagation) e.stopPropagation();
			  		else e.cancelBubble = true;
				});
			}
		}
	}
	if (ipid == '' || layer_data[ipid].type != 'subnet') {
		var tool = $('<i class="fa fa-times"></i>');
		panel.find('.tools').append(tool);
		tool.click(function (e) {
			if (confirm('Delete layer "' + layer_data[id].param.name.value + '"?')) {
				removeLayer(id);
			}
			var e = window.event || e;
	  		if (e.stopPropagation) e.stopPropagation();
	  		else e.cancelBubble = true;
		});
	}

	// prepare tree data
	var tree_data = {};
	$.each(layer_data[id].param, function(key) {
		if (this.type == 'grp') {
			tree_data[key] = {name: key, type: 'folder', layer: id, folder: key};
			tree_data[key]['children'] = {};
			$.each(this.param, function(ckey) {
				tree_data[key].children[ckey] = {name: ckey, type: 'item', layer: id, folder: key, param: ckey};
			});
		}
		else {
			tree_data[key] = {name: key, type: 'item', layer: id, folder: '', param: key};
		}
	});
	var treeDataSource = new DataSourceTree({ data: tree_data });

	// generate tree view
	var tree = $('#' + id + '-tree');
	tree.admin_tree({ dataSource: treeDataSource });
	tree.find('[class*="fa-"]').addClass("fa"); // To add font awesome support

	$.each(layer_data[id].param, function(key) {
		if (this.type != 'grp') {
			if (this.enabled) { handleSelectItem(id, '', key); }
			else { handleDeselectItem(id, '', key); }
		}
		if (this.type == 'enum') { handleDisplay(id, '', key); }
	});

	// tree triggers
	tree.on('opened.fu.tree', function(e, data) {
		layer = $(data).attr('layer');
		folder = $(data).attr('folder');
		$.each(layer_data[layer].param[folder].param, function(key) {
			if (this.enabled) { handleSelectItem(layer, folder, key); }
			else { handleDeselectItem(layer, folder, key); }
			if (this.type == 'enum') { handleDisplay(layer, folder, key); }
		});
	});

	tree.on('selected.fu.tree', function(e, data) {
		layer = $(data.target).attr('layer');
		folder = $(data.target).attr('folder');
		param = $(data.target).attr('param');
		var $list = null;
		if (folder == '') { $list = layer_data[layer].param; }
		else { $list = layer_data[layer].param[folder].param; }
		
		// update the data
		handleSelectItem(layer, folder, param);
		
		// update mutex data
		if ($list[param].mutex) {
			$.each($list[param].mutex, function(key) {
				if ($list[param].mutex[key]) { // mutex=1, is mutex
					if ($list[key].enabled) {
						handleDeselectItem(layer, folder, key);
					}
				}
				else { // mutex=0, is bind
					if ($list[key].required && !$list[key].enabled) {
						handleSelectItem(layer, folder, key);
					}
				}
			});
		}
	});

	tree.on('deselected.fu.tree', function(e, data) {
		layer = $(data.target).attr('layer');
		folder = $(data.target).attr('folder');
		param = $(data.target).attr('param');
		var $list = null;
		if (folder == '') { $list = layer_data[layer].param; }
		else { $list = layer_data[layer].param[folder].param; }
		
		if ($list[param].required == 1 || (param == 'phase' && layer_data[layer].mutex.length)) {
			handleSelectItem(layer, folder, param);
		}
		else {
			handleDeselectItem(layer, folder, param);
		}
	});

	// inplace layers
	for (var i=0; i<layer_data[id].inplace_child.length; i++) {
		showLayerData(layer_data[id].inplace_child[i]);
	}
}