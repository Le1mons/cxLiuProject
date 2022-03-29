# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
好友界面——推荐好友
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 是否刷新
    _isref = int(data[0])
    _tuijianList = g.m.friendfun.getTuijianList(uid, _isref)
    _resList = []
    for i in _tuijianList:
        _fmtDict = {}
        _fmtDict['headdata'] = g.m.userfun.getShowHead(i)
        _fmtDict['zhanli'] = g.m.zypkjjcfun.getDefendHeroZhanli(i)
        _ghData = g.m.gonghuifun.getGongHuiByUid(i)
        _fmtDict['guildname'] = _ghData['name'] if _ghData else ''
        _resList.append(_fmtDict)

    _res['d'] = {'userlist': _resList}
    return _res

if __name__ == '__main__':
    g.debugConn.uid = g.buid('lsm4444')
    print doproc(g.debugConn, data=[1])