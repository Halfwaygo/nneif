import json
import time
from django.shortcuts import render
from django.http import JsonResponse
from collections import OrderedDict
from NNElf import settings

file = open(settings.STATIC_URL + 'json/layer.json', 'r')
layer_def = json.loads(file.read(), object_pairs_hook=OrderedDict)
file.close()
file = open(settings.STATIC_URL + 'json/subnet.json', 'r')
subnet_def = json.loads(file.read(), object_pairs_hook=OrderedDict)
file.close()

def main(request):
    param = {}
    param['network'] = ['LeNet', 'AlexNet', 'VGG 16 Layers', 'GoogLeNet', 'ResNet']
    
    param['input'] = []
    param['calc'] = []
    param['inplace'] = []
    param['trans'] = []
    param['output'] = []
    for key in layer_def:
        param[layer_def[key]['type']].append(key)
    
    param['Inception'] = []
    param['ResNet'] = []
    for key in subnet_def:
        param[subnet_def[key]['category']].append(key)
    return render(request, 'main.html', param)

def define(request):
    return JsonResponse({'layer': json.dumps(layer_def), 'subnet': json.dumps(subnet_def)})

def save(request):
    info = 'success'
    try:
        if request.method == 'POST':
            name = request.POST['name']
            data = request.POST['json']
            filename = settings.STATIC_URL + 'json/upload/' + name + '_' + time.strftime('%Y%m%d%H%M%S', time.localtime()) + '.json'
            file = open(filename, 'w')
            file.write(data)
            file.close()
    except:
        import sys
        info = '%s || %s' % (sys.exc_info()[0], sys.exc_info()[1])
    return JsonResponse({'message': info})

def preset(request):
    filename = settings.STATIC_URL + 'json/presets/' + request.GET['name'] + '.json'
    file = open(filename, 'r')
    data = json.loads(file.read(), object_pairs_hook=OrderedDict)
    file.close()
    return JsonResponse({'data': json.dumps(data)})