#!/usr/bin/python
# coding:utf-8

import urllib2
import json
import re

import sys
sys.path.append('game')
import g


uploaded = {}
TOKEN = 'eb67adbb5c39829b144751aff458043fa76b28ae079802de72ff61f551de59f5'
CATID = '65'

def getDesc (f):
    try:
        text = ""
        fo = open('game/api/'+f+'.py')
        text = fo.read( )

        apiDesc = re.findall("'''(.*?)'''", text,re.S)
        if not len(apiDesc)>0:
            apiDesc = re.findall('"""(.*?)"""', text,re.S)
        if len(apiDesc)>0:
            return apiDesc[0].replace("\n","").replace(" ","")
        else:
            return ""
    except:
        return ""

def addApi (api,args,res={}):
    return
    try:
        _addApi(api,args,res)
    except:
        print 'ERROR:YAPI_ADDAPI_ERROR',api

def _addApi (api,args,res={}):
    global uploaded,TOKEN,CATID
    if api in uploaded:
        return

    req_query = []
    for index,arg in enumerate(args):

        if type(arg)!=type('') and type(arg)!=type(u'') and type(arg)!=type(1):
            arg = json.dumps(arg)

        req_query.append({
            "name": "d"+str(index),
            "example": str(arg),
            "desc":"第"+ str(index) +"个参数",
        })
    
    apiShort = api.replace('api_','')

    _sendmsg = json.dumps(res, indent=4, ensure_ascii=False, encoding='utf-8', cls=g.m.myjson.UserEncoder)

    msgLine = _sendmsg.split('\n')
    msgLine = map(lambda x: '        ' + x, msgLine)
    msgLine.insert(0, '    ```json\n')
    msgLine.append('    ```\n')
    markdown = '\n'.join(msgLine)

    data = {
        'req_query': req_query,
        "method": "GET",
        "title": apiShort + " "+ getDesc(api),
        "path":"/?a="+ str(apiShort),
        'token':TOKEN,
        "catid":CATID,
        "res_body_type":"json",
        "res_body": json.dumps(res),
        "res_body_to_json_schema":"1",
        "markdown": markdown

    }

    headers = {'Content-Type': 'application/json'}
    request = urllib2.Request(url='http://10.0.0.6:8888/api/interface/add', headers=headers, data=json.dumps(data))
    response = urllib2.urlopen(request)
    
    uploaded[ api ] = 1
    #html = response.read().decode('utf-8').encode('gbk')
    #print html

'''
data = {
    'name': '测试',
    'project_id': '14',
    'token':'eb67adbb5c39829b144751aff458043fa76b28ae079802de72ff61f551de59f5',
}

headers = {'Content-Type': 'application/json'}
request = urllib2.Request(url='http://10.0.0.6:8888/api/interface/add_cat', headers=headers, data=json.dumps(data))
response = urllib2.urlopen(request)

html = response.read()
print html
'''





if __name__ == '__main__':
    _addApi("fashita_open", ["tid", "1"], {"s":1, "d":{"aa":{"ab":1}, "cc":{"bb":1}}})
