#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g

'''
玩家 - 改名
'''

def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _newName = data[0]
    # 名称参数有误
    if not isinstance(_newName, basestring):
        _res["s"] = -1
        _res["errmsg"] = g.L('user_rename_res_-1')
        return _res

    for ele in _newName:
        if not g.C.is_chinese(ele):
            _res['s'] = -3
            _res['errmsg'] = g.L("user_rename_res_-3")
            return _res

    # 不可超过6个汉字
    if len(_newName) > 6 or len(_newName) < 2:
        _res["s"] = -2
        _res["errmsg"] = g.L('user_rename_res_-2')
        return _res

    # 名称含有非法字符
    if g.checkWord(_newName) != True:
        _res["s"] = -4
        _res["errmsg"] = g.L("user_rename_res_-4")
        return _res

    # 名称已存在
    _ghInfo = g.mdb.find1('userinfo', {"name": _newName}, fields=['_id', 'name'])
    if _ghInfo:
        _res["s"] = -5
        _res["errmsg"] = g.L('user_rename_res_-5')
        return _res

    # 更名花费
    gud = g.getGud(uid)
    _firstRename = gud.get('isrenamed',0)
    _data = {'name': _newName}
    if not _firstRename:
        g.setAttr(uid,{'ctype':'user_isrenamed'},{'v':0})
        gud['isrenamed'] = 1
        g.gud.setGud(uid,gud)
        _data.update({'isrenamed': 1})
        _sendData = {'attr':{'name': _newName,'isrenamed':1}}
    else:
        _need = [{'a':'attr','t':'rmbmoney','n':500}]
        _chk = g.chkDelNeed(uid, _need)
        # 材料不足
        if not _chk['res']:
            if _chk['a'] == 'attr':
                _res['s'] = -100
                _res['attr'] = _chk['t']
            else:
                _res["s"] = -104
                _res[_chk['a']] = _chk['t']
            return _res

        # 扣除消耗
        _sendData = g.delNeed(uid, _need, 0, logdata={'act': 'user_rename'})
        _sendData['attr'].update({'name':_newName})
    g.sendChangeInfo(conn, _sendData)

    # 更新王者的信息
    _wzDatas = g.crossDB.find('wzquarterwinner',{'ranklist.uid': uid},fields=['ranklist'])
    if _wzDatas:
        for _wzData in _wzDatas:
            for i in _wzData['ranklist']:
                if i['uid'] == uid:
                    i['name'] = _newName
                    g.crossDB.update('wzquarterwinner', {'_id': _wzData['_id']}, {'ranklist':_wzData['ranklist']})
                    break

    # 设置信息
    # g.mdb.update('userinfo', {'uid': uid}, _data)
    g.m.userfun.updateUserInfo(uid, _data)
    return _res

if __name__ == '__main__':
    uid = g.buid("1")
    g.debugConn.uid = uid
    data = [u'虚招']
    a = doproc(g.debugConn, data)
    print a