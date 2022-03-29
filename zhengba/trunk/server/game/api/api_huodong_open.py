#!/usr/bin/python
#coding:utf-8
'''
活动 - 打开活动子列表
'''

if __name__=='__main__':
    import sys
    sys.path.append('..')

import g



def proc(conn,data):
    """

    :param conn:
    :param data: [活动hdid:int]
    :return:
    ::

        {'s': 1, 'd': {'info':{活动数据}, 'myinfo': {'val':当前值,gotarr:[已领取奖励]}}
    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()


# 判断用户uid是否存在
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    hdid = int(data[0])
    #获取已开启的活动列表
    # _hdList = g.m.huodongfun.getOpenList(uid, 1,isxianshi=0)
    _hdList = g.m.huodongfun.getBaseOpenList(uid)
    _hdList = [tmp['hdid'] for tmp in _hdList if tmp['hdid'] == hdid]
    #活动未开放无法获取列表
    if hdid not in _hdList:
        _res["s"]=-1
        _res["errmsg"]=g.L('global_nohuodong')
        return (_res)

    #获取活动返回的数据,每个活动单独逻辑去做
    _rdata = g.m.huodongfun.getHuodongData(uid, hdid)
    #子逻辑有错误判断
    if "errmsg" in _rdata:
        return (_rdata)

    _res["d"] = _rdata
    return (_res)

if __name__ == "__main__":
    uid = g.buid('ysr1')
    g.debugConn.uid = uid
    from pprint import pprint

    pprint (doproc(g.debugConn, [12342423]))
    # import json
    #
    # newNameList = ["刘坤", "王宇佳", "罗孟非", "陈姚"]
    # namelist = ["张洪岩", "喻顺瑞", "万子旭", "赵德智", "金元元", "李逸枫","王凌霄","王能鹏","刘思敏"]
    # newNameList.append(g.C.RANDLIST(namelist, num=6))
    # a = json.dumps(newNameList, encoding='UTF-8', ensure_ascii=False, indent=2)
    #
    # print a