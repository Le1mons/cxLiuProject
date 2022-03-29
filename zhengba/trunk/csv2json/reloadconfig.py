#!/usr/bin/python
#coding:utf-8

from socket import *
_ip = raw_input(u"请输入要重新载入配置的服务器地址:".encode("gbk"))
s = socket(AF_INET,SOCK_STREAM)
_port=6001
if _ip.find(":")!=-1:
    _nArr = _ip.split(":")
    _port = int(_nArr[1])
    _ip = _nArr[0]
s.connect((_ip,_port))
s.send("reload")
s.close()
print u"重载完毕...".encode("gbk")
raw_input(u"按任意键继续".encode("gbk"))