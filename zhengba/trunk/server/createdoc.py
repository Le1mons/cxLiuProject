#!/usr/bin/python
#coding:utf-8
import os,re
import sys
reload(sys)
sys.setdefaultencoding('utf8')


rootpath = os.path.split(os.path.realpath(__file__))[0]
doc=[]

def file_extension(path): 
    return os.path.splitext(path)[1] 

def createDoc ():
    global rootpath
    api = rootpath + r'\game\api\\'
    print api
    apiList = os.listdir(api)
    for f in apiList:
        print f
        ext = file_extension(f)
        if ext!='.py':continue
        analFile(api+f)
        #break

def analFile (f):
    global doc

    info = {}
    info['api'] = os.path.basename(f)
    info['desc'] = '无'
    info['parm'] = []

    fo = open(f)
    text = ""
    try:
         text = fo.read( )
    finally:
         fo.close()
    
    apiDesc = re.findall("'''(.*?)'''", text,re.S)
    if len(apiDesc)>0:
        info['desc'] = apiDesc[0]
    
    f = open(f,"r")  
    lines = f.readlines()

    for linenum,line in enumerate(lines):
        data = re.findall("[^a-z]data\[[0-9]\]", line,re.S)
        _p = {}
        if len(data)>0:
            _p['code'] = '<span class="linenum">'+str(linenum)+'.</span> '+line
            re_words = re.compile(u"[\u4e00-\u9fa5]+")
            preLine = re_words.findall(lines[linenum-1].decode('utf8'))
            
            if len(preLine)>0:
                _p['preline'] = '<span class="linenum">'+str(linenum-1)+'.</span> '+lines[linenum-1]#''.join(preLine)
            
            info['parm'].append(_p)
    
    for linenum,line in enumerate(lines):
        #data.getStr(0)
        data = re.findall("[^a-z]data.get\w*\([0-9]\)", line,re.S)
        _p = {}
        if len(data)>0:
            _p['code'] = '<span class="linenum">'+str(linenum)+'.</span> '+line
            re_words = re.compile(u"[\u4e00-\u9fa5]+")
            preLine = re_words.findall(lines[linenum-1].decode('utf8'))
            
            if len(preLine)>0:
                _p['preline'] = '<span class="linenum">'+str(linenum-1)+'.</span> '+lines[linenum-1]#''.join(preLine)
            
            info['parm'].append(_p)

    doc.append(info)

def fmtParm (p):
    text = ""
    for v in p:
        text += "<p class='parmp'>"
        if 'preline' in v:
            text += "<span class='zhushi'>"+v['preline']+"</span><br/>"
        
        text +=  v['code']
        text += "</p>"
    
    if text=="":text="无"
    return text

def writeDoc ():
    global doc
    html = '''
        <meta charset="utf-8"/>
        <style>
        table {  
            font-family: verdana,arial,sans-serif;
            font-size:11px;  
            color:#111;  
            border-width: 1px;  
            border-color: #666666;  
            border-collapse: collapse;  
            width:100%;
            margin:30px 0;
        }  
        table th {  
            border-width: 1px;  
            padding: 8px;  
            border-style: solid;  
            border-color: #666666;  
            background-color: #dedede;  
        }  
        table td {  
            border-width: 1px;  
            padding: 8px;  
            border-style: solid;  
            border-color: #666666;  
            background-color: #ffffff;  
        } 
        .parmp{margin-bottom:15px;padding:5px; border-bottom:1px solid #eee}
        .zhushi{color:#888}
        #api{ width:90%;margin:auto;font-size:12px;font-family: verdana,arial,sans-serif;}
        </style>
        <table border = "1" id="api">
                <tr>
                        <th>接口</th>
                        <th style="width:30%">描述</th>
                        <th>参数</th>
                </tr>'''
    
    import json
    _json = {}

    for v in doc:
        if str(v['api']).startswith('api_'):
            _json[ str(v['api']) ] = str(v['desc'])

        html += '''
                <tr>
                        <td>'''+ str(v['api']) +'''</td>
                        <td>'''+ str(v['desc']) +'''</td>
                        <td>'''+ fmtParm(v['parm'])  +'''</td>
                </tr>'''

    html += '</table>'

    file_object = open('_apidoc.html', 'w')
    file_object.write( html )
    file_object.close()

    file_object = open('json/_apidesc.json', 'w')
    file_object.write( json.dumps(_json) )
    file_object.close()

if __name__=='__main__':
    createDoc()
    writeDoc()
    pass