function rmFromArray(item, array) {
	for(var i=array.length-1; i>=0; i--) {
	   if(array[i] == item) {
		   array.splice(i, 1);
		   break;
	   }
   }
}

function hasAttr(obj, attri) {
	if (typeof(obj.attr(attri)) == 'undefined') return false;
	return true;
}

function collapse_box(obj) {
	if ($(obj).hasClass('collapse')) {
		$(obj).removeClass('collapse').addClass('expand');
		var i = $(obj).children('.fa-chevron-up');
		i.removeClass('fa-chevron-up').addClass('fa-chevron-down');
		var el = $(obj).parentsUntil('.box').parent().children('.box-body');
		el.slideUp(200);
	}
}

function expand_box(obj) {
	if ($(obj).hasClass('expand')) {
		$(obj).removeClass('expand').addClass('collapse');
		var i = $(obj).children('.fa-chevron-down');
		i.removeClass('fa-chevron-down').addClass('fa-chevron-up');
		var el = $(obj).parentsUntil('.box').parent().children('.box-body');
		el.slideDown(200);
	}
}

function noneActive() {
	$('#layer-config-content').css('padding', 10);
	collapse_box('#layer-config-box');
	$('#layer-config-content').children().remove();
	$('#layer-config-content').append($('<div>Please select a layer.</div>'));
}

function ActiveLayer(id, active) {
	var layer = $('#' + id);
	if (active) {
		if (layer.hasClass('active')) {
			rmFromArray(id, activeLayers);
		}
		else {
			layer.addClass('active');
		}
		activeLayers.unshift(id);
	}
	else {
		if (layer.hasClass('active')) {
			layer.removeClass('active');
			rmFromArray(id, activeLayers);
		}
	}
	
	if(activeLayers.length) {
		$('#layer-config-content').children().remove();
		showLayerData(activeLayers[0]);
		expand_box('#layer-config-box');
	}
	else {
		noneActive();
	}
}

function setInputState(state) {
	var form = $('#input-form');
	var name = $('#input-name');
	var warning = $('#input-warning');
	var space = $('#input-space');
	var submit = $('#input-submit');
	if (form.hasClass('has-success')) { form.removeClass('has-success'); }
	if (form.hasClass('has-error')) { form.removeClass('has-error'); }
	switch (state) {
	case 'default':
		if (!hasAttr(submit, 'disabled')) { submit.attr('disabled', ''); }
		name[0].value = '';
		warning[0].style.display = 'none';
		space[0].style.display = 'none';
		break;
	case 'success':
		warning[0].style.display = 'none';
		space[0].style.display = 'none';
		form.addClass('has-success');
		if (hasAttr(submit, 'disabled')) { submit.removeAttr('disabled'); }
		break;
	case 'error':
		if (!hasAttr(submit, 'disabled')) { submit.attr('disabled', ''); }
		form.addClass('has-error');
		warning[0].style.display = '';
		space[0].style.display = '';
		break;
	}
}

function checkInput(e) {
	var warning = $('#input-warning');
	
	var name = $('#input-name')[0].value.toLowerCase();
	if (name.length == 0) {
		warning.html('<i class="fa fa-times-circle"></i> Layer name cannot be empty.');
		setInputState('error');
		return false;
	}
	$('#input-name')[0].value = name;
	
	var char = null;
	if (char = whitelist.exec(name)) {
		warning.html('<i class="fa fa-times-circle"></i> Character "' + char + '" is invalid.');
		setInputState('error');
		return false;
	}

	setInputState('success');
	e = e ? e : window.event;
	var code = e.which ? e.which : e.keyCode;
	if (code == 13) {
		$('#input-submit').click();
	}
	return true;
}