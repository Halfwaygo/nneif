//when layer size change
function layerResize(layer) {
	instance.updateOffset({'elId': layer[0].id, 'recalc': true});
}

// when phase state change
function togglePhase(id, recur) {
	layer_data[id].param.phase.value = (layer_data[id].param.phase.value == 'TRAIN' ? 'TEST' : 'TRAIN');
	var layer = $('#' + id);
	if (layer.hasClass('layer-phase')) {
		layer.children('.phase').html(layer_data[id].param.phase.value == 'TRAIN' ? 'T' : 'V');
	}
	else {
		drawLayer(id);
	}
	if (recur && layer_data[id].mutex.length) {
		togglePhase(layer_data[id].mutex, false);
	}
}

function drawTempLayer(param) {
	var layer = null;
	if (param.cls == 'subnet') {
		layer = $('<div class="btn btn-danger layer" id="drop-temp-layer">' + param.name + '</div>');
	}
	else {
		layer = $('<div class="btn layer" id="drop-temp-layer">' + param.cls + '</div>');
	   switch (layer_def[param.cls].type) {
	   	case 'input': layer.addClass('btn-success'); break;
			case 'calc': layer.addClass('btn-warning'); break;
			case 'inplace': layer.addClass('btn-default'); break;
			case 'trans': layer.addClass('btn-yellow'); break;
			case 'output': layer.addClass('btn-purple'); break;
	    }
	}
   $('#canvas').append(layer);
   layer.css('left', param.posx - layer[0].offsetWidth / 2).css('top', param.posy - layer[0].offsetHeight / 2);
}

//draw the layer on canvas
function drawLayer(id, pos) {
	var data = layer_data[id];
	if (pos) {
		var layer = $('<div class="btn layer" id="' + id + '"></div>');
      $('#canvas').append(layer);

	   switch (data.type) {
	   	case 'input': layer.addClass('btn-success'); break;
	   	case 'calc': layer.addClass('btn-warning'); break;
	   	case 'inplace': layer.addClass('btn-default'); break;
	   	case 'trans': layer.addClass('btn-yellow'); break;
	   	case 'output': layer.addClass('btn-purple'); break;
	   	case 'subnet': layer.addClass('btn-danger'); break;
	    }

	   if (data.max_in) {
		   layer.append($('<div class="in-docker"><i class="fa fa-arrow-circle-o-down"></i></div>'));
	   }

	   layer.append($('<div class="layer-html">' + data.param.name.value + '</div>'));

	   if (data.type != 'output') {
		   layer.append($('<div class="out-docker"><i class="fa fa-arrow-circle-o-down"></i></div>'));
	   }

	   if (pos.drop) {
		   data.left = pos.x - layer[0].offsetWidth / 2;
		   data.top = pos.y - layer[0].offsetHeight / 2;
	   }
      layer.css('left', data.left).css('top', data.top);

      drawLayer(id);
	}
	else {
		var layer = $('#' + id);
		if (data.dead) {
			if (!layer.hasClass('btn-grey')) { layer.addClass('btn-grey'); }
		}
		else {
			if (layer.hasClass('btn-grey')) { layer.removeClass('btn-grey'); }
		}

		if (data.param.phase && data.param.phase.enabled) {
			if (!layer.hasClass('layer-phase')) {
				layer.addClass('layer-phase');
		      layer.append($('<div class="btn btn-primary phase"></div>'));
		      layer.children('.phase').click(function (e) {
			  		togglePhase(id, true);
			  		ActiveLayer(id, true);
			  		var e = window.event || e;
			  		if (e.stopPropagation) e.stopPropagation();
			  		else e.cancelBubble = true;
			  	});
			}
			if (data.param.phase.value == 'TRAIN') { layer.children('.phase').html('T'); }
			else { layer.children('.phase').html('V'); }
		}
		else if (layer.hasClass('layer-phase')) {
			layer.removeClass('layer-phase');
			layer.children('.phase').remove();
		}

		var html = data.param.name.value;
		if (data.type != 'subnet') {
			for (var i=0; i<data.inplace_child.length; i++) {
				html += '<div class="separator"></div>';
				html += layer_data[data.inplace_child[i]].param.name.value;
			}
		}
		layer.children('.layer-html').html(html);
		layerResize(layer);
		instance.repaintEverything();
	}
}