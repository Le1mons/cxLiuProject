#!/usr/bin/python
#coding:utf-8

# 积天返利活动 到期重置
if __name__=='__main__':
    import sys
    sys.path.append('..')

import g
from huodong import jitianfanli11

def proc(arg,karg):
    print 'huodong_jitianfanli start ...'
    return

    # 判断活动是否结束
    htyp = 11
    nt = g.C.NOW()
    _all = g.mdb.find('hdinfo',{'htype':htyp},fields=['stime','etime','rtime','hdid','htype'])

    if not _all:
        return

    for i in _all:
        if i['stime']<nt<i['etime']:
            return

    info = _all[0]
    etime = info['etime']
    hdid = info['hdid']
    # 活动结束
    if nt > etime:
        _stime = g.C.ZERO(0 * 24 * 3600 + nt)
        _etime = g.C.ZERO(14 * 24 * 3600 + nt) + 24 * 3600 - 1
        _rtime = g.C.ZERO(14 * 24 * 3600 + nt) + 24 * 3600 - 1
        _st = g.C.getDate(_stime, "%m月%d日00:00")
        _et = g.C.getDate(_rtime, "%m月%d日23:59")
        _showtime = _st + "-" + _et

        upsetDict = {
            'stime':_stime,
            'rtime':_rtime,
            'etime':_etime,
            'hdid':nt + 21 * 2,
            'showtime':_showtime,
        }
        res = g.mdb.update('hdinfo',{'hdid':hdid,'htype':11},upsetDict)
        print 'huodong_jitianfanli update',res



    print 'huodong_jitianfanli end ...'



if __name__ == '__main__':
    proc(1,1)
