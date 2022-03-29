#!/usr/bin/python
# coding:utf-8
'''
    巅峰王者-王者之巅
'''

if __name__ == '__main__':
    import sys
    sys.path.append('..')
    sys.path.append('./game')
import g


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


# 判断用户uid是否存在
@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    _round = data[0]
    if _round == -1:
        # 默认读取最新一期的数据
        _round = g.crossDB.count('wzquarterwinner', {})
    _tmpData = g.crossDB.find1('wzquarterwinner', {'round': _round}, fields=['_id', 'ranklist'])
    if _tmpData == None:
        # 没有记录
        _res['d'] = {}
        return _res

    _tmpData.update({'round': _round})
    _res['d'] = _tmpData
    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('wqew12334')
    g.m.gud.reGud(g.debugConn.uid)
    tmp = doproc(g.debugConn, [-1])
    print tmp
