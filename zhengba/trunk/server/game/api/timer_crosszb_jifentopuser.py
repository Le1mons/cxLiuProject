#!/usr/bin/python
#coding:utf-8

'''
    积分赛发消息
'''
import sys
if __name__ == '__main__':
    sys.path.append('..')
import g

def proc(arg,karg):
    print 'crosszb_jifentopuser timer start .......'
    if g.C.getWeek()  != 5:
        return

    #对于积分每个种族第一名玩家广播全服消息
    _nt = g.C.NOW()
    _dkey = g.C.getWeekNumByTime(_nt)
    _con = g.m.crosszbfun.getCon()
    _msgcon = _con['jifen']['msg']
    _rank = []
    _rank = g.crossDB.find("crosszb_jifen",{"dkey":_dkey},sort=[['jifen',-1],['zhanli',-1]],limit=3,fields=['_id'])
    if len(_rank) == 0:
        print 'crosszb_jifen No JoinUser'
        return

    #获得各个玩家的详细信息
    _str = []
    for ele in _rank:
        _name = ele['headdata']['name']
        _servername = g.m.crosscomfun.getSNameBySid(ele['sid'])
        _str.append(_name)
        _str.append(_servername)

    # g.m.crosschatfun.chatRoom.addCrossChat({'msg':_msg,"mtype":4,"fdata":{},"extarg":{}})
    g.m.chatfun.sendPMD('SYSTEM', 'crosszb_jifen', *_str)
    print 'crosszb_jifentopuser timer end .......'

if __name__ == '__main__':
    proc(1,2)