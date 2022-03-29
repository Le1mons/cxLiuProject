#!/usr/bin/python
# coding:utf-8
'''
首冲-查看首冲信息
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [商店id:str]
    :return:
    ::

        {'d': {'shouchong':{
                    '1 第一套奖励':{'show':是否显示, 'rec':[领取的时间],'chkrectime':[可以领的时间]}
                    '2 第2套奖励':{'show':是否显示, 'rec':[领取的时间],'chkrectime':[可以领的时间]}
                    '3 第3套奖励':{'show':是否显示, 'rec':[领取的时间],'chkrectime':[可以领的时间]}
                'paynum': 充值金额
        }}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _resData = g.m.shouchongfun.getShouChongData(uid)
    _res['d'] = {'shouchong':_resData,'paynum':g.m.payfun.getAllPayYuan(uid)}
    return _res

if __name__ == '__main__':
    uid = g.buid("tk1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[6, 2])