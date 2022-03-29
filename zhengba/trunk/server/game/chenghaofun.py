#!/usr/bin/python
# coding:utf-8

"""
玩家称号相关
"""

import g

DBNAME = 'chenghao'


def getCon(key=None):
    _con = g.GC['zaoxing']['chenghao']
    if key:
        return _con[key]

    return _con

def getChengHaoList(uid, cid=None):
    """
    获取称号列表
    :param uid:
    :return:
    """
    _data = g.getAttrOne(uid, {'ctype': 'chenghao_list'})
    if not _data:
        return

    if cid:
        return {cid:_data.get('time', {}).get(cid, 0)}
    else:
        _rList = {}
        for cid in _data['v']:
            _rList[cid] = _data.get('time', {}).get(cid, 0)

        return _rList


def wearChengHao(uid, cid):
    """
    称号穿戴
    :param uid:
    :param cid:
    :return:
    """
    gud = g.getGud(uid)
    gud['chenghao'] = cid
    g.gud.setGud(uid,gud)

    g.m.userfun.updateUserInfo(uid, {'chenghao': cid})

    changeData = {'attr':{'chenghao':cid}}
    # 重算英雄buff
    resetChengHaoBuff(uid)
    _heroData = g.m.herofun.reSetAllHeroBuff(uid, {'lv': {'$gt': 1}})
    if _heroData:
        changeData['hero'] = _heroData

    resetCrossFight(uid)  # 重算跨服阵容

    return changeData

def takeOffChengHao(uid):
    """
    称号脱下
    :param uid:
    :param cid:
    :return:
    """
    gud = g.getGud(uid)
    gud['chenghao'] = ''
    g.gud.setGud(uid,gud)

    g.m.userfun.updateUserInfo(uid, {'chenghao': ''})

    changeData = {'attr':{'chenghao':''}}
    # 重算英雄buff
    resetChengHaoBuff(uid)
    _heroData = g.m.herofun.reSetAllHeroBuff(uid, {'lv': {'$gt': 1}})
    if _heroData:
        changeData['hero'] = _heroData

    resetCrossFight(uid)  # 重算跨服阵容

    return changeData


def resetChengHaoBuff(uid):
    """
    重算穿戴的称号buff
    :param uid:
    :return:
    """
    gud = g.getGud(uid)
    cid = gud['chenghao']
    if not cid:
        buff = {}
    else:
        _chenghaoCon = getCon(cid)
        buff = _chenghaoCon['buff']

    g.m.userfun.setCommonBuff(uid, {'buff.chenghao':[buff]})
    return buff


def chkChengHaoTime(uid):
    """
    称号过期时间检测
    :param uid:
    :return:
    """
    gud = g.getGud(uid)
    cid = gud['chenghao']
    if not cid:  # 没有佩戴称号
        return

    _chenghao = getChengHaoList(uid, cid)  # type:dict
    if not _chenghao:
        return

    if _chenghao[cid] > g.C.NOW() or _chenghao[cid] == 0:  # 称号没有过期
        return

    # 佩戴称号已经过期
    gud['chenghao'] = ''
    g.gud.setGud(uid, gud)
    g.m.userfun.updateUserInfo(uid, {'chenghao': ''})

    changeData = {'attr':{'chenghao':''}}

    # 重算英雄buff
    resetChengHaoBuff(uid)
    _heroData = g.m.herofun.reSetAllHeroBuff(uid, {'lv': {'$gt': 1}})
    if _heroData:
        changeData['hero'] = _heroData

    resetCrossFight(uid)  # 重算跨服阵容

    return changeData

# 重算跨服整容
def resetCrossFight(uid):
    _fightData = g.m.zypkjjcfun.getDefendHero(uid)
    _chkFightData = g.m.fightfun.chkFightData(uid, _fightData,side=1)
    if _chkFightData['chkres'] < 1:
        return

    # 设置上阵英雄
    _zhanli = _chkFightData['zhanli']
    g.m.zypkjjcfun.setUserJJC(uid,{'defhero': _fightData,'zhanli':_zhanli})

    # 设置到跨区数据库中
    _userFightData = g.m.fightfun.getUserFightData(uid, _chkFightData['herolist'], 1,sqid=_fightData.get('sqid'))
    _userFightData.sort(key=lambda x:x.get('pos',0))
    _data = g.m.crosscomfun.fmtCrossUserData(uid,_userFightData)
    _data['zhanli'] = _zhanli
    _data['headdata'] = _data.pop('head')
    _data["headdata"] = g.m.userfun.getShowHead(uid)
    _data["headdata"]['ext_servername'] = g.m.crosscomfun.getSNameBySid(g.getGud(uid)['sid'])
    g.crossDB.update('jjcdefhero',{'uid':uid},_data,upsert=True)

