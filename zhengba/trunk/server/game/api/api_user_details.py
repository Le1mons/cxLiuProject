#!/usr/bin/python
# coding:utf-8
'''
公用接口 -- 查看信息
'''

import sys

sys.path.append('..')

import g



# 获取玩家防守阵容数据
def getDefHeroInfo(uid, _type):
    def getDefhero():
        _defHero = g.mc.get('{0}_defhero_{1}'.format(_type, uid))
        if not _defHero:
            _defHero = g.m.zypkjjcfun.getDefendHero(uid)
            g.mc.set('{0}_defhero_{1}'.format(_type, uid), _defHero, 10)
        return _defHero

    if _type == 'zypkjjc':
        _defHero = getDefhero()
        _defHero = [_defHero]
    elif _type == 'championtrial':
        _defHero = g.m.championfun.getDefendHero(uid)
    _tidList = []
    for i in _defHero:
        _tidList += [i[x] for x in i if x not in ('sqid', 'pet')]
    _tidList = map(g.mdb.toObjectId, _tidList)
    _heroList = g.m.herofun.getMyHeroList(uid, where={'_id': {'$in': _tidList}})
    # 调整站位信息
    _res = []
    for x in _defHero:
        _resHero = []
        for _pos in x:
            if _pos in ('sqid', ):
                _resHero.append({'sqid': x[_pos]})
                continue
            elif _pos == 'pet':
                continue
            for _hero in _heroList:
                if g.mdb.toObjectId(x[_pos]) == _hero['_id']:
                    _hero['pos'] = _pos
                    _hero['_id'] = str(_hero['_id'])
                    _resHero.append(_hero)
        _res.append(_resHero)
    return _res

def proc(conn, data):
    """

    :param conn:
    :param data: [要查看的类别:str('zypkjjc','championtrial'), 玩家uid:str]
    :return:
    ::

        {'d': {
            'ghid':公会id,
            'ghname':公会名,
            'ghpower':职位,
            'zhanli':战力,
            'isfriend':是否好友,
            'isshield':是否屏蔽,
            'headdata':{},
            'defhero':[{竞技场阵容}]
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 要查看的类别
    _type = data[0]
    # 要查看玩家的uid
    _uid = data[1]

    _resData = {}
    _resData['isfriend'] = 0
    _resData['isshield'] = 0
    _benfu = int(_uid.split('_')[0]) in g.getSvrList()
    if _benfu:
        gud = g.getGud(_uid)
        # 数据不存在
        if not gud:
            _res['s'] = -1
            _res['errmsg'] = g.L('user_details_res_-1')
            return _res

        _resData['ghid'] = gud['ghid']
        _resData['ghname'] = gud['ghname']
        _resData['ghpower'] = gud['ghpower']
        _resData['zhanli'] = gud['maxzhanli']
        _resData['headdata'] = g.m.userfun.getShowHead(_uid)

        _resHero = getDefHeroInfo(_uid, _type)
        _resData['defhero'] = _resHero
        if _type == 'zypkjjc':
            _resData['defhero'][0] += g.m.petfun.gtPetFight(_uid,0)

        friendsData = g.mdb.find1('friend', {'uid': uid}, fields=['_id', 'friend', 'shield'])
        if friendsData:
            _resData['isfriend'] = 1 if _uid in friendsData.get('friend', []) else 0
            _resData['isshield'] = 1 if _uid in friendsData.get('shield', []) else 0

    else:
        _user = g.crossDB.find1('cross_friend', {'uid': _uid}, fields=['_id','head'])
        if not _user:
            _res['s'] = -2
            _res['errmsg'] = g.L('user_details_res_-1')
            return _res

        _resData['zhanli'] = _user['head'].pop('zhanli', 0)
        _resData['svrname'] = g.m.crosscomfun.getSNameBySid(_uid.split('_')[0])
        _resData['headdata'] = _user['head']
        _resData['defhero'] = _user['head'].pop('defhero', [])

    _res['d'] = _resData
    return _res


if __name__ == '__main__':
    uid = g.buid("lsq333")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=["zypkjjc", '0_5ccf51b49dc6d628852f1748'])