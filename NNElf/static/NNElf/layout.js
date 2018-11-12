function AlignHori() {
	if (activeLayers.length < 2) return;
	var id = activeLayers[0];
	var layer = $('#' + id);
	var top = layer_data[id].top + layer[0].offsetHeight / 2;
	for (var i=activeLayers.length-1; i>0; i--) {
		id = activeLayers[i];
		layer = $('#' + id);
		layer_data[id].top = top - layer[0].offsetHeight / 2;
		layer.css('top', layer_data[id].top);
	}
	instance.repaintEverything();
}

function AlignVert() {
	if (activeLayers.length < 2) return;
	var id = activeLayers[0];
	var layer = $('#' + id);
	var left = layer_data[id].left + layer[0].offsetWidth / 2;
	for (var i=activeLayers.length-1; i>0; i--) {
		id = activeLayers[i];
		layer = $('#' + id);
		layer_data[id].left = left - layer[0].offsetWidth / 2;
		layer.css('left', layer_data[id].left);
	}
	instance.repaintEverything();
}

function sortLayerHori(a, b) {
	var $la = layer_data[a], $lb = layer_data[b];
	if ($la.left == $lb.left) {
		if ($la.top == $lb.top) {
			var ats = parseInt(a.substring(6));
			var bts = parseInt(b.substring(6));
			return ats - bts;
		}
		return $la.top - $lb.top;
	}
	else
		return $la.left - $lb.left;
}
function ArrangeHori() {
	if (activeLayers.length < 2) return;
	var activeClone = activeLayers.slice(0);
	activeClone.sort(sortLayerHori);

	var id = activeLayers[0];
	var left = layer_data[id].left;
	var pos = $.inArray(id, activeClone);
	for (var i=pos-1; i>=0; i--) {
		id = activeClone[i];
		var layer = $('#' + id);
		left = left - layer[0].offsetWidth - 50;
		layer_data[id].left = left;
		layer.css('left', left);
	}

	id = activeLayers[0];
	var layer = $('#' + id);
	left = layer_data[id].left + layer[0].offsetWidth + 50;
	for (var i=pos+1; i<activeClone.length; i++) {
		id = activeClone[i];
		layer = $('#' + id);
		layer_data[id].left = left;
		layer.css('left', left);
		left = left + layer[0].offsetWidth + 50;
	}
	instance.repaintEverything();
}

function sortLayerVert(a, b) {
	var $la = layer_data[a], $lb = layer_data[b];
	if ($la.top == $lb.top) {
		if ($la.left == $lb.left) {
			var ats = parseInt(a.substring(6));
			var bts = parseInt(b.substring(6));
			return ats - bts;
		}
		return $la.left - $lb.left;
	}
	else
		return $la.top - $lb.top;
}
function ArrangeVert() {
	if (activeLayers.length < 2) return;
	var activeClone = activeLayers.slice(0);
	activeClone.sort(sortLayerVert);

	var id = activeLayers[0];
	var top = layer_data[id].top;
	var pos = $.inArray(id, activeClone);
	for (var i=pos-1; i>=0; i--) {
		id = activeClone[i];
		var layer = $('#' + id);
		top = top - layer[0].offsetHeight - 50;
		layer_data[id].top = top;
		layer.css('top', top);
	}

	id = activeLayers[0];
	var layer = $('#' + id);
	top = layer_data[id].top + layer[0].offsetHeight + 50;
	for (var i=pos+1; i<activeClone.length; i++) {
		id = activeClone[i];
		layer = $('#' + id);
		layer_data[id].top = top;
		layer.css('top', top);
		top = top + layer[0].offsetHeight + 50;
	}
	instance.repaintEverything();
}