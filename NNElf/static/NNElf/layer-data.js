function newLayer(id, pos) {
   drawLayer(id, pos);
   ActiveLayer(id, true);
   var layer = $('#' + id);

   // make the layer draggable
   instance.draggable(layer, {
	   constrain: function(pos) { return [Math.max(0, pos[0]), Math.max(0, pos[1])]; },
	   stop: function(e) { layer_data[id].left = e.pos[0]; layer_data[id].top = e.pos[1]; if(layer.hasClass('active')) layer.removeClass('active'); }
   });

   // add endpoints to layer
	if (layer_data[id].type != 'output') {
		instance.makeSource(layer, {
			filter: '.out-docker',
			anchor: 'Continuous',
			connectorStyle: { lineWidth: 2, strokeStyle: color, outlineWidth: 7, outlineColor: 'transparent' },
			connectionType: 'connBasic'
			});
	}
	if (layer_data[id].max_in) {
		instance.makeTarget(layer, {
			dropOptions: { hoverClass: 'dragHover' },
			anchor: 'Continuous',
			allowLoopback: false
			});
	}
	// response to click on layer
	layer.click(function (e) {
		if (layer.hasClass('active')) { ActiveLayer(id, false); }
		else { ActiveLayer(id, true); }
		var e = window.event || e;
  		if (e.stopPropagation) e.stopPropagation();
  		else e.cancelBubble = true;
	});
}

function repaintAll() {
	$('#network_name_editor').html(layer_data.name);
	child = {};
	$.each(layer_data, function(id) {
		if (id == 'name') { return true; } // continue
		var $data = layer_data[id];
		if (!$data.inplace_parent.length) {
			newLayer(id, {x:$data.left, y:$data.top});
			child[id] = [];
			$.extend(child[id], $data.child);
			$data.parent = [];
			$data.child = [];
		}
	});
	$.each(child, function(pid) {
		for (var i=child[pid].length-1; i>=0; i--) {
			var cid = child[pid][i];
			instance.connect({source: pid, target: cid, type: 'connBasic'});
		}
	});
	$('#canvas').click();
}

function removeLayer(id) {
	var $data = layer_data[id];
	if ($data.mutex.length) { layer_data[$data.mutex].mutex = ''; }
	for (var i=$data.child.length-1; i>=0; i--) { rmFromArray(id, layer_data[$data.child[i]].parent); }
	for (var i=$data.parent.length-1; i>=0; i--) { rmFromArray(id, layer_data[$data.parent[i]].child); }
	while ($data.inplace_child.length) { removeLayer($data.inplace_child[$data.inplace_child.length - 1]); }
	if ($data.inplace_parent.length) {
		rmFromArray(id, layer_data[$data.inplace_parent].inplace_child);
		ActiveLayer($data.inplace_parent, true);
	}
	else {
		ActiveLayer(id, false);
		instance.remove(id);
	}
	delete layer_data[id];
}

function removeAll() {
	$.each(layer_data, function(id) {
		if (id == 'name') { return true; } // continue
		removeLayer(id);
	});
	layer_data.name = 'Untitled_Network';
	$('#network_name_editor').html(layer_data.name);
	activeLayers = [];
	noneActive();
}

function editLayerName(id, name) {
	var $data = layer_data[id];
	var success = true;
	var mutex_id = '';
	$.each(layer_data, function(layerId) {
		if (layerId == 'name') { return true; } // continue
		if (this.param.name.value == name) {
			if (this.mutex.length) { success = false; return false; }
			if (this.type != $data.type) { success = false; return false; }
			if (!this.param.phase || !$data.param.phase) { success = false; return false; }

			this.mutex = id;
			mutex_id = layerId;
			if (this.param.phase.enabled) {
				$data.param.phase.enabled = true;
				$data.param.phase.value = (this.param.phase.value == 'TRAIN' ? 'TEST' : 'TRAIN');
			}
			else if ($data.param.phase.enabled) {
				this.param.phase.enabled = true;
				this.param.phase.value = ($data.param.phase.value == 'TRAIN' ? 'TEST' : 'TRAIN');
				drawLayer(layerId);
			}
			else {
				this.param.phase.enabled = true;
				this.param.phase.value = 'TRAIN';
				drawLayer(layerId);
				$data.param.phase.enabled = true;
				$data.param.phase.value = 'TEST';
			}

			return false; // break
		}
	});

	if (!success) { return false; }
	if ($data.mutex.length) { layer_data[$data.mutex].mutex = ''; }
	$data.mutex = mutex_id;
	$data.param.name.value = name;
	if ($data.inplace_parent.length) {
		drawLayer($data.inplace_parent);
		// ActiveLayer($data.inplace_parent, false);
	}
	else {
		drawLayer(id);
		ActiveLayer(id, false);
	}
	return true;
}

function parseParameter(key, $source, $target) {
	if ($source.type == 'lr' || $source.type == 'filler') { $target['type'] = 'grp'; }
	else if ($source.type == 'bool' || $source.type == 'phase') { $target['type'] = 'enum'; }
	else { $target['type'] =  $source.type; }

	if ($target.type != 'grp') {
		$target['required'] = $source.required;
		$target['enabled'] = ($source.required>0 ? true : false);
	}

	if ($target.type == 'grp') {
		$target['param'] = {};
		if ($source.type == 'lr') {
			$target.param['lr_mult'] = {'type': 'flt', 'required': 0, 'enabled': false, 'default': 1.0, 'value': 1.0};
			$target.param['decay_mult'] = {'type': 'flt', 'required': 0, 'enabled': false, 'default': 1.0, 'value': 1.0};
			if (key == 'bias_param') {
				$target['display'] = {'bias_term': ['true']};
				$target.param.lr_mult.enabled = true;
				$target.param.lr_mult.value = 2.0;
				$target.param.decay_mult.enabled = true;
				$target.param.decay_mult.value = 0.0;
			}
		}
		else if ($source.type == 'filler') {
			$target.param['type'] = {'type': 'enum', 'required': 0, 'enabled': false, 'enum': ['constant', 'uniform', 'gaussian', 'xavier'], 'default': 'constant', 'value': 'constant'};
			$target.param['value'] = {'type': 'flt', 'required': 0, 'enabled': false, 'default': 0.0, 'value': 0.0, 'display': {'type': ['constant']}};
			$target.param['min'] = {'type': 'flt', 'required': 0, 'enabled': false, 'default': 0.0, 'value': 0.0, 'display': {'type': ['uniform']}};
			$target.param['max'] = {'type': 'flt', 'required': 0, 'enabled': false, 'default': 1.0, 'value': 1.0, 'display': {'type': ['uniform']}};
			$target.param['mean'] = {'type': 'flt', 'required': 0, 'enabled': false, 'default': 0.0, 'value': 0.0, 'display': {'type': ['gaussian', 'xavier']}};
			$target.param['std'] = {'type': 'flt', 'required': 0, 'enabled': false, 'default': 1.0, 'value': 1.0, 'display': {'type': ['gaussian', 'xavier']}};
			if (key == 'weight_filler') {
				$target.param.type.enabled = true;
				$target.param.type.value = 'gaussian';
				$target.param.std.enabled = true;
				$target.param.std.value = 0.01;
			}
			else if (key == 'bias_filler') {
				$target['display'] = {'bias_term': ['true']};
			}
		}
		else {
			$.each($source.param, function(ikey) {
				$target.param[ikey] = {};
				parseParameter(ikey, $source.param[ikey], $target.param[ikey]);
			});
		}
	}
	else if ($target.type == 'enum') {
		if ($source.type == 'bool') {
			$target['enum'] = ['false', 'true'];
			$target['default'] = ($source.default ? 'true' : 'false');
			$target['value'] = $target.default;
		}
		else if ($source.type == 'phase') {
			$target['enum'] = ['TRAIN', 'TEST'];
			$target['default'] = $target['value'] = 'ALL';
		}
		else {
			$target['enum'] = [];
			$.extend($target.enum, $source.enum);
			$target['default'] = $target['value'] = $source.default;
		}
	}
	else {
		$target['default'] = $target['value'] = $source.default;
	}
	
	if ($source.mutex) {
		$target['mutex'] = {};
		$.extend($target.mutex, $source.mutex);
	}
}

function initSubnetData(name, cls) {
	var id = initLayerData(name, 'subnet', cls);
	if (id.length == 0) return id;
	return id;
}

function initLayerData(name, cls, subnet) {
	var mutex_id = '';
	var mutex_train = true;
	var id = '';
	do {
		id = 'layer-' + (new Date().getTime());
	} while (layer_data[id]);
	$.each(layer_data, function(layerId) {
		if (layerId == 'name') { return true; } // continue
		if (this.param.name.value == name) {
			if (this.mutex.length) { id = ''; return false; }
			if (subnet) { id = ''; return false; }
			else {
				if (this.type != layer_def[cls].type) { id = ''; return false; }
				if (!this.param.phase || !layer_def[cls].param.phase) { id = ''; return false; }
			}
			this.mutex = id;
			mutex_id = layerId;
			if (this.param.phase.enabled) {
				if (this.param.phase.value == 'TRAIN') {
					mutex_train = false;
				}
			}
			else {
				this.param.phase.enabled = true;
				this.param.phase.value = 'TRAIN';
				drawLayer(layerId);
				mutex_train = false;
			}
			return false; // break
		}
	});
	
	if (id.length == 0) return id;

	layer_data[id] = {};
	var $data = layer_data[id];
	if (subnet) {
		$data['type'] = 'subnet';
		$data['cls'] = subnet;
		$data['max_in'] = subnet_def[subnet].max_in;
	}
	else {
		$data['type'] = layer_def[cls].type;
		$data['cls'] = cls;
		$data['max_in'] = layer_def[cls].max_in;
	}
	$data['mutex'] = mutex_id;
	$data['left'] = 0;
	$data['top'] = 0;
	$data['parent'] = [];
	$data['child'] = [];
	$data['inplace_parent'] = '';
	$data['inplace_child'] = [];
	$data['num'] = 0;
	if (cls == 'Data') { $data['channels'] = 3; }
	else { $data['channels'] = 0; }
	$data['height'] = 0;
	$data['width'] = 0;
	$data['dead'] = false;

	$data['param'] = {'name': {'type': 'str', 'required': 1, 'enabled': true, 'default': '', 'value': name}};
	if (!subnet) {
		var $param = $data.param;
		if (layer_def[cls].param) {
			$.each(layer_def[cls].param, function(key) {
				$param[key] = {};
				parseParameter(key, layer_def[cls].param[key], $param[key]);
			});
		}

		if (mutex_id.length && $param.phase) {
			$param.phase.enabled = true;
			if (mutex_train) {
				$param.phase.value = 'TRAIN';
			}
			else {
				$param.phase.value = 'TEST';
			}
		}
	}

	return id;
}