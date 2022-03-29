#!/usr/bin/env python
# coding:utf-8

import sys,os,time,socket
import config

#校验当前区端口是否正常
def main ():
    conf = config.CONFIG
    try:
        localports = conf['gameSvr'] + [conf['dispatchSvr']] + [conf['socketSvr']] + [conf['mainSvr']]
        ports = conf['MEMCACHE'] + [ conf['DBCONFIG']['host']+":"+ str(conf['DBCONFIG']['port']) ]

        for port in localports:
            ports.append("127.0.0.1:"+str(port))

        for port in ports:
            ip,p = port.split(':')
            v = telnet(ip.strip(),p.strip())
            
            txt = port
            if v:
                txt += " ok"
            else:
                txt += " ERROR!!!"
            
            print txt

    except:
        pass

def telnet(ip,port):
    try:
        mysocket=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
        mysocket.connect((ip,int(port)))
        #mysocket.shutdown(1)
        mysocket.close()
        return True
    except:
        return False

if __name__=='__main__':
    main()

