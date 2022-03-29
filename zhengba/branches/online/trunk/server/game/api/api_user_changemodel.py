#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
玩家 - 更换模型
'''

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 玩家新头像hid
    _newModel = data[0]
    # 获取玩家头像列表
    _avaterList = g.m.userfun.getHeadList(uid)
    _confList = g.GC['zaoxing']['head'].keys()

    # 头像不存在
    if _newModel not in _avaterList and _newModel not in _confList:
        _res['s'] = -1
        _res['errmsg'] = g.L('user_changeavater_res_-1')
        return _res

    g.m.userfun.updateUserInfo(uid,{'model':_newModel},{'act':'user_changemodel'})
    g.sendChangeInfo(conn, {'attr': {'model':_newModel}})

    # 更新跨服数据
    sid = g.getSvrIndex()
    g.crossDB.update('jjcdefhero',{'uid':uid,'sid':sid},{'headdata': g.m.userfun.getShowHead(uid)})
    g.crossDB.update('crosszb_jifen', {'uid': uid, 'dkey': g.C.getWeekNumByTime(g.C.NOW())}, {'headdata': g.m.userfun.getShowHead(uid)})
    g.crossMC.delete(g.m.crosszbfun.getCrossUserKey(uid))
    # 更新王者的信息
    _wzDatas = g.crossDB.find('wzquarterwinner',{'ranklist.uid': uid},fields=['ranklist'])
    if _wzDatas:
        for _wzData in _wzDatas:
            for i in _wzData['ranklist']:
                if i['uid'] == uid:
                    i['model'] = _newModel
                    g.crossDB.update('wzquarterwinner', {'_id': _wzData['_id']}, {'ranklist':_wzData['ranklist']})
                    break

    return _res

if __name__ == '__main__':
    uid = g.buid("lsq111")
    g.debugConn.uid = '620_5bcfdc5a48fc7001fb18aa39'
    data = ['25076']
    a = doproc(g.debugConn, data)
    print a