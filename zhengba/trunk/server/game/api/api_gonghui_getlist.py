#!/usr/bin/python
#coding:utf-8
'''
公会 - 获取公会列表
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
    sys.path.append("./game")

import g



def proc(conn,data):
    """

    :param conn:
    :param data: [页面:int]
    :return:
    ::

        {"d": {"maxpage":最大页面, "list": [{"ghid":公会id,"hzname":会长名字}],"applylist":[已申请的公会id]}
        's': 1}

    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()
    
@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}

    uid = conn.uid
    _gCon = g.m.gonghuifun.getCon()
    _page = int(data[0])
    _basePage = _page
    if _page < 1: _page = 1
    #页码
    _pageSize = _gCon['maxnumperpage']
    _maxGHNum = g.mdb.count('gonghui')
    if _maxGHNum == 0:
        _resData = {}
        _resData['maxpage'] = 0
        _resData['list'] = []
        _res['d'] = _resData
        return _res
    
    _maxData = divmod(_maxGHNum,_pageSize)
    _maxPage = _maxData[0]
    if _maxData[1] > 0: _maxPage += 1
    if _page > _maxPage: _page = _maxPage

    _keys = 'name,flag,lv,joinlv,usernum,maxusernum'
    _ghList = g.mdb.find('gonghui',sort=[["lv",-1],["exp",-1],["usernum",-1]],fields=_keys.split(','),limit=_pageSize,skip=(_page - 1) * _pageSize)
    #_ghList = g.m.gonghuifun.getGonghuiInfo(keys=_keys,sort=[["lv",-1],["exp",-1],["usernum",-1]],limit=_pageSize,skip=(_page - 1) * _pageSize)
    _retVal = []
    _gidList = map(lambda x:str(x["_id"]),_ghList)
    #会长信息列表
    #_hzArr = g.m.gonghuifun.getGonghuiUserInfo(keys='_id,uid,gid',where={"ghid":{"$in":_gidList},"power":0})
    _hzArr = g.mdb.find('gonghuiuser',{"ghid":{"$in":_gidList},"power":0},fields=['_id','uid','ghid'])
    _hzinfoMap = {}
    for ele in _hzArr:
        _tmpGud = g.getGud(ele["uid"])
        _hzinfoMap[str(ele["ghid"])] = _tmpGud["name"]

    for ele in _ghList:
        _data = {}
        _gid = str(ele["_id"])
        if _gid not in _hzinfoMap: continue
        del ele["_id"]
        ele["ghid"] = _gid
        ele["hzname"] = _hzinfoMap[_gid]
        _data.update(ele)
        _retVal.append(_data)
    
    _resData = {}
    _resData['maxpage'] = _maxPage
    _resData['list'] = _retVal
    #申请列表
    # if _basePage  == 0:
    _resData['applylist'] = []
    _applyList = g.mdb.find('gonghuiapply',{'uid':uid},fields=['_id','ghid'],limit=50)
    for d in _applyList:
        _resData['applylist'].append(d['ghid'])

    _res["d"] = _resData
    return _res

if __name__ == '__main__':
    uid = g.buid('666')
    g.debugConn.uid = uid
    print doproc(g.debugConn,[1])