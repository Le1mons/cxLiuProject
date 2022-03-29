# coding: utf-8
#!/usr/bin/python
# coding: utf-8
'''
好友界面——打开主界面
'''

import sys

if __name__ == "__main__":
    sys.path.append("game")
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [uid:str]
    :return:
    ::

        {"friend":[{headdata}], "tiliinfo":体力信息,"accept":可接受的印记列表,"gift":已赠送列表,"received":已接受的
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    gud = g.getGud(uid)
    _data = g.mdb.find1('friend',{'uid': uid}, fields=['_id','friend']) or {}
    _friends = _data.get('friend',[])

    # 减上跨服的
    _crossApply = g.crossDB.find1('cross_friend',{'uid':uid},fields=['_id','del','agree','shield'])
    if _crossApply:
        _set = {}
        if 'del' in _crossApply or 'shield' in _crossApply:
            _friends = list(set(_friends) - set(_crossApply.get('del',[]) + _crossApply.get('shield', [])))
            _set = {'$set':{'friend':_friends}}

        if 'agree' in _crossApply and _crossApply['agree']:
            _friends += _crossApply['agree']

            _friends = _friends[:g.GC['friend']['base']['friendmaxnum']]

            _set = {'$set':{'friend': _friends}}

        g.crossDB.update('cross_friend', {'uid': uid}, {'$unset':{'agree':1,'del':1}})
        g.mdb.update('friend', {'uid': uid}, _set)

    if not data or data[0] is None:

        # 获取助战信息
        _friendList = []
        _crossUid = [i for i in _friends if not g.m.crosscomfun.chkIsThisService(i)]
        _all = g.crossDB.find('cross_friend',{'uid':{'$in': _crossUid}},fields=['_id','logintime','uid','head'])
        _uid2logintime = {i.pop('uid'):i for i in _all}

        _nt = g.C.NOW()
        # 区服
        _QUdata = g.m.crosscomfun.getServerData() or {'data': {}}
        for i in _friends:
            _fmtDict = {}
            # 本区
            if g.m.crosscomfun.chkIsThisService(i):
                _fmtDict['headdata'] = g.m.userfun.getShowHead(i)
                _fmtDict['headdata']["svrname"] = _QUdata['data'].get(i.split('_')[0], {}).get('servername','unknown')
                _fmtDict['lasttime'] = _fmtDict['headdata'].pop('lasttime')
            # 跨服找不到人就直接删除
            elif i not in _uid2logintime or 'head' not in _uid2logintime[i]:
                g.mdb.update('friend', {'uid': uid}, {'$pull': {'friend': i}})
                continue
            else:
                _fmtDict['headdata'] = _uid2logintime[i]['head']
                if 'zhanli' not in _fmtDict['headdata'] and 'defhero' in _fmtDict['headdata']:
                    _fmtDict['zhanli'] = 0
                    for x in _fmtDict['headdata']['defhero'][0]:
                        if 'hid' not in x:
                            continue
                        _fmtDict['zhanli'] += x['zhanli']
                _fmtDict['lasttime'] = _uid2logintime[i].get('logintime', g.C.NOW())

            _friendList.append(_fmtDict)

        _tiliInfo = g.m.friendfun.getTiliNum(uid,getcd=1)
        _yinjiList = []
        _yinjiInfo = g.m.friendfun.getGiftAndAccept(uid)
        _yinjiList = g.m.friendfun.getCanReceiveYinji(uid)
        _received = _yinjiInfo['accept']
        _giftList = _yinjiInfo['gift']

        _res['d'] = {'friend': _friendList,'tiliinfo':_tiliInfo,'accept': _yinjiList,'gift':_giftList,'received':_received}
    else:
        _res['d'] = {'friend': []}
        for i in _friends:
            _res['d']['friend'].append({'headdata': {'uid': i}})
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[]
)
