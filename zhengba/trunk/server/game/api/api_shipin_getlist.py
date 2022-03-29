# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
饰品——获取所有未穿戴的饰品
'''

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {'d': {'list': {饰品tid: {'num':数量,'spid':饰品id,'star':饰品星级，’color‘:饰品品质}}}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _shipinList = g.m.shipinfun.getShipinList(uid)
    _retVal = {}
    for ele in _shipinList:
        _tid = str(ele['_id'])
        ele['tid'] = _tid
        del ele['_id']
        _retVal[_tid] = ele

    _res["d"] = {"list":_retVal,'awake':g.getAttrByCtype(uid,'shipin_awake',bydate=0,default={})}
    return _res

if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["2055", 1])