# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
好友界面——一键发送和领取
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
from ZBFight import ZBFight

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 助战的好友的uid
    #_toUid = data[0]
    _info = g.mdb.find1('friend',{'uid':uid})
    if _info and 'treasure' in _info and 'boss' in _info['treasure']\
        and 'dps' in _info['treasure']['boss']:
        _dps = _info['treasure']['boss']['dps']
        _resList = []
        for i in _dps:
            _temp = {}
            _temp['headdata'] = g.m.userfun.getShowHead(i)
            _temp['dps'] = _dps[i]
            _resList.append(_temp)
    else:
        _resList = []
    _res['d'] = {'dps': _resList}
    return _res

if __name__ == '__main__':
    uid = g.buid("1")
    g.debugConn.uid = uid
    print doproc(g.debugConn,['0_5aea81d0625aee4a04a0146d'])