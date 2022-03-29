#!/usr/bin/python
#coding:utf-8

'''
系统统计相关方法
'''
import g

#统计在线人数
def getOnineNum():
    _num = 0
    _nt = g.C.NOW()
    #120秒内心跳时间更新过统计为在线
    _heartTime = _nt - 300
    _data = g.mdb.find('userinfo',where={"lasttime":{"$gt":_heartTime}},fields={"_id":0,"uid":1})
    _num = len(_data)
    return _num
        
    
    
if __name__=='__main__':
    print getOnineNum()