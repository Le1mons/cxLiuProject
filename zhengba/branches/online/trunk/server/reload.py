#!/usr/bin/python
#coding:utf-8
'''
@author：刺鸟
@email：4041990@qq.com
'''
#主控服务器

import urllib2,socket
import config

def sendReload():
    #重载所有webserver
    for port in config.CONFIG['gameSvr']:
        _url = "http://127.0.0.1:" + str(port) + "/?a=system_reload&d=[]"
        print _url
        try:
            print urllib2.urlopen(_url,timeout=5).read()
        except:
            print 'reload webserver error',_url
    
    #重载socketserver
    try:
        mysocket=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
        mysocket.connect(('127.0.0.1',int(config.CONFIG['socketSvr'])))
        mysocket.send( chr(1)+chr(1) + 'system_reload' + chr(4) + "" + chr(2) )
    except:
        print 'reload socketserver error'


sendReload()