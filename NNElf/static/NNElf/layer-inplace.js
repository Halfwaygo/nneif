function signinLayer(id) {
	var $data = layer_data[id];
	var pid = $data.parent[0];
	var $parent = layer_data[pid];

	//ActiveLayer(id, false);
	rmFromArray(id, activeLayers);
	instance.remove(id);

	$data.parent = [];
	$parent.child = [];
	while ($data.child.length) {
		var cid = $data.child.pop();
		rmFromArray(id, layer_data[cid].parent);
		instance.connect({source: pid, target: cid, type: 'connBasic'});
	}

	$data.inplace_parent = pid;
	$parent.inplace_child.push(id);
	while ($data.inplace_child.length) {
		var cid = $data.inplace_child.shift();
		layer_data[cid].inplace_parent = pid;
		$parent.inplace_child.push(cid);
	}

	drawLayer(pid);
	ActiveLayer(pid, true);
}

function signoutLayer(id) {
	var $data = layer_data[id];
	var pid = $data.inplace_parent;
	var $parent = layer_data[pid];

	newLayer(id, {x: $data.left, y: $data.top, drop: 0});
	var conn = instance.getConnections({source: pid});
	for (var i=conn.length-1; i>=0; i--) { instance.detach(conn[i]); }

	while ($parent.child.length) {
		var cid = $parent.child.pop();
		rmFromArray(pid, layer_data[cid].parent);
		instance.connect({source: id, target: cid, type: 'connBasic'});
	}
	instance.connect({source: pid, target: id, type: 'connBasic'});

	$data.inplace_parent = '';
	while ($parent.inplace_child.length) {
		var cid = $parent.inplace_child.pop();
		if (cid == id) break;
		layer_data[cid].inplace_parent = id;
		$data.inplace_child.unshift(cid);
	}

	drawLayer(pid);
	drawLayer(id);
	ActiveLayer(id, true);
}