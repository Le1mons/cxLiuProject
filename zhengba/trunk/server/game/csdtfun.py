#!/usr/bin/python
# coding:utf-8


import g


# 获取锻造配置信息
def getCon(type, id):
    _data = g.GC['csdt'][type].get(str(id), {})

    return _data


# 红点
def getHongDian(uid):
    _res = {'csdt': 0}

    # 打造需要的道具充足时有红点
    _data = g.GC['csdt']['itemdz']
    for _, v in _data.items():
        if g.chkDelNeed(uid, v['itemneed']):
            _res['csdt'] = 1
            break

    return _res


if __name__ == '__main__':
    uid = g.buid('xuzhao')
    _con = g.GC['flag']['base']
    print g.C.getDateDiff(g.C.NOW(), 1566532800)