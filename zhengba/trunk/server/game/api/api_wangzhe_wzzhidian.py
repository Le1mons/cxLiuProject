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
    """

    :param conn:
    :param data: [第几轮:int]
    :return:
    ::

        {'d': {
            'ranklist':[{headdata}]
            'ugid':组别
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


# 判断用户uid是否存在
@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    _round = data[0]
    if _round == -1:
        # 默认读取最新一期的数据
        _round = g.crossDB.count('wzquarterwinner', {})
    _tmpData = g.crossDB.find1('wzquarterwinner', {'round': _round}, fields=['_id', 'ranklist', 'ctime', 'grouplist'])
    if _tmpData == None:
        # 没有记录
        _res['d'] = {}
        return _res

    groupList = _tmpData.get('grouplist', [3, 3, 3])
    groupidx = g.m.crosswzfun.getGroupIdx(g.m.crosswzfun.getDOpenDay(_tmpData['ctime']))
    # groupidx = g.m.crosswzfun.getUgid(uid)
    ugid = 3
    # if groupidx < len(groupList):
    #     ugid = groupList[groupidx]

    if isinstance(_tmpData['ranklist'], list):
        _tmpData['ranklist'] = {'3': _tmpData['ranklist']}
    if str(ugid) not in _tmpData['ranklist']:
        tmpUgidList = [int(t) for t in _tmpData['ranklist']]
        tmpUgidList.sort()
        ugid = int(tmpUgidList[-1])

    _sort = sorted(_tmpData['ranklist'].keys(), key=int)
    _rankList = {}
    for i in xrange(len(_sort)):
        _rankList[str(i + 1)] = _tmpData['ranklist'][_sort[i]]

    _tmpData['ranklist'] = _rankList
    _tmpData.update({'round': _round})
    # _tmpData['ugid'] = ugid
    _res['d'] = _tmpData
    return _res


if __name__ == '__main__':
    g.debugConn.uid = g.buid('wqew12334')
    g.m.gud.reGud(g.debugConn.uid)
    tmp = doproc(g.debugConn, [-1])
    print tmp
