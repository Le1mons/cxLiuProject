# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
十字军远征 ——— 使用道具
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
def proc(conn, data):
    """

    :param conn:
    :param data: [道具id:str， 英雄tid:str]
    :return:
    ::

        {'d': {'status':状态 参照open, 'supply':{补给品}}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 道具id
    _id = str(data[0])
    # 英雄得tid
    _tid = data[1]

    _szjData = g.getAttrByDate(uid,{'ctype':'shizijun_data'},keys='_id,status')
    # 十字军信息不存在
    if not _szjData:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 根据操作结果判断是否给对应得item 数量-1
    _returnInfo = g.mdb.update('playattr',{'ctype':'shizijun_supply','v.{}'.format(_id):{'$gt':0},'uid':uid},{'$inc':{'v.{}'.format(_id):-1}})
    # updatedExisting 为false 表示此操作不成功   扣除消耗
    if _returnInfo['updatedExisting'] == False:
        _need = g.GC['shizijun']['base']['supply'][_id]['need']
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

        _sendData = g.delNeed(uid, _need,issend=False,logdata={'act':'shizijun_useitem','id':_id})
        g.sendChangeInfo(conn, _sendData)

    _szjData[0]['status'] = g.m.shizijunfun.useItem(_id, _szjData[0]['status'], _tid)
    g.setAttr(uid, {'ctype': 'shizijun_data'}, _szjData[0])

    _supply = g.getAttrByCtype(uid, 'shizijun_supply', bydate=False, default={})
    for i in _szjData[0]['status']:
        _szjData[0]['status'][i]['hp'] = int(0.01 * _szjData[0]['status'][i]['hp'] * _szjData[0]['status'][i]['maxhp'])

    _res['d'] = {'status': _szjData[0]['status'], 'supply': _supply}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    a = doproc(g.debugConn, [1, '5be8f211c0911a41685ef49e'])
    print a