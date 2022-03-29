#!/usr/bin/python
# coding:utf-8
'''
中秋节 - 主界面
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: []
    :return:
    ::

        {"d": {
            task:       {data:{任务id:完成次数}, rec:[已领奖任务id]}
            moon:       当前经验值
            xixi:       是否完成月兔嬉戏
            store:      [index 0的商品已购买次数, index 0的商品已购买次数]
            giftpack:   {礼包id: 购买次数}
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid, data):
    _chkData = {}

    _hd = g.m.huodongfun.getHDinfoByHtype(62, ttype="etime")
    # 活动还没开
    if not _hd or 'hdid' not in _hd:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_hdnoopen')
        return _chkData

    _chkData['hdid'] = _hd['hdid']
    _chkData['con'] = _hd['data'].get('con','midautumn')
    return _chkData

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _chkData = _checkCond(uid, data)
    if 's' in _chkData:
        return _chkData

    # g.setPlayAttrDataNum(uid, 'midautumn_redpoint')
    _res['d'] = g.m.midautumnfun.getData(uid, _chkData['hdid'], _chkData['con'])
    _res['d']['xixirank'] = g.m.midautumnfun.getXixiRank()
    return _res

if __name__ == '__main__':
    uid = g.buid("ysr1")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[10])