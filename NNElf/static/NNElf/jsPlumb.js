jsPlumb.ready(function () {
   // initialize jsPlumb
	instance = jsPlumb.getInstance ({
		DragOptions: { cursor: 'pointer', zIndex: 2000 },
		Endpoint: 'Blank',
		Connector: connType,
		HoverPaintStyle: { lineWidth: 3, strokeStyle: colorHover, outlineWidth: 7, outlineColor: 'transparent' },
		ConnectionOverlays: [
		   [ 'Arrow', {
			   location: 1,
			   width: 10,
			   length: 10
			} ]
       ],
     Container: 'canvas'
	});
	instance.registerConnectionType('connBasic', { anchor: 'Continuous', connector: connType });

   // response to make a connection
   instance.bind('connection', function(conn) {
	   var source = conn.sourceId;
	   var target = conn.targetId;
	   var sName = layer_data[source].param.name.value;
	   var tName = layer_data[target].param.name.value;

	   if ($.inArray(source, layer_data[target].parent) >= 0) {
		   instance.detach(conn);
		   $('#alert-box').find('.modal-body').html('The connection from "' + sName + '" to "' + tName + '" already exists.');
		   $('#alert-box').modal('show');
		   return;
	   }

	   var parents = [];
	   $.extend(parents, layer_data[source].parent);
	   for (var i=0; i<parents.length; i++) {
		   if (parents[i] == target) {
			   instance.detach(conn);
			   $('#alert-box').find('.modal-body').html('The connection from "' + sName + '" to "' + tName + '" is cyclic.');
			   $('#alert-box').modal('show');
			   return;
		   }
		   var p = layer_data[parents[i]].parent;
		   for (var j=0; j<p.length; j++) {
			   if ($.inArray(p[j], parents) == -1) {
				   parents.push(p[j]);
			   }
		   }
	   }

	   // add a mutexed parent
	   for (var i=layer_data[target].parent.length-1; i>=0; i--) {
		   var parent = layer_data[target].parent[i];
		   if (layer_data[parent].param.name.value == sName) {
			   layer_data[target].parent.push(source);
			   layer_data[source].child.push(target);
			   ActiveLayer(target, true);
			   return;
		   }
	   }

	   parents = [];
	   for (var i=layer_data[target].parent.length-1; i>=0; i--) {
		   var tmpName = layer_data[layer_data[target].parent[i]].param.name.value;
		   if ($.inArray(tmpName, parents) == -1) parents.push(tmpName);
	   }
	   if (layer_data[target].max_in == -1 || parents.length < layer_data[target].max_in) {
		   layer_data[target].parent.push(source);
		   layer_data[source].child.push(target);
		   ActiveLayer(target, true);
		   return;
	   }
	   else {
		   instance.detach(conn);
		   if (layer_data[target].max_in == 1) {
			   $('#alert-box').find('.modal-body').html('Layer "' + tName + '" accepts only 1 bottom.');
			}
			else {
				$('#alert-box').find('.modal-body').html('Layer "' + tName + '" accepts only ' + layer_data[target].max_in + ' bottoms.');
			}
		   $('#alert-box').modal('show');
	   }
   	});

	// click on connection to detach it
	instance.bind('click', function(conn) {
		var source = conn.sourceId;
		var target = conn.targetId;
		var sName = layer_data[source].param.name.value;
		var tName = layer_data[target].param.name.value;
		if (confirm('Delete the connection from "' + sName + '" to "' + tName + '"?')) {
			rmFromArray(source, layer_data[target].parent);
			rmFromArray(target, layer_data[source].child);
			instance.detach(conn);
		}
	});
});