#!/usr/bin/python
# coding:utf-8
'''
传说大厅 -  锻造
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [锻造类型：str, 锻造id：str, 放入的英雄tid列表：list，或者是锻造物品的数量：int]
    :return:
    ::



    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid

    _type = str(data[0])
    _id = str(data[1])

    # 类型参数错误
    if _type not in ['itemdz', 'herodz']:
        _res['s'] = -1
        _res['errmsg'] = g.L('global_argserr')
        return _res

    # 未放入消耗物品
    if not data[2]:
        _res['s'] = -1
        _res['errmsg'] = g.L('csdt_res_2')
        return _res

    # 无该锻造信息
    _con = g.m.csdtfun.getCon(_type, _id)
    if not _con:
        _res['s'] = -2
        _res['errmsg'] = g.L('csdt_res_1')
        return _res

    # 英雄锻造
    if _type == 'herodz':
        _tidList = data[2]
        _needKeys = ['heroneed1', 'heroneed2']
        # 消耗英雄数量不正确
        if len(_tidList) != len(_needKeys):
            _res['s'] = -3
            _res['errmsg'] = g.L('hero_hecheng_res_-5')
            return _res
        # 道具消耗不足
        _needItem = list(_con['itemneed'])
        _needItem.extend(_con['duanzaoneed'])
        _chk = g.chkDelNeed(uid, _needItem)
        # 判断消耗品是否充足
        if not _chk['res']:
            if _chk['a'] == 'attr':
                _res['s'] = -100
                _res['attr'] = _chk['t']
            else:
                _res["s"] = -104
                _res[_chk['a']] = _chk['t']
            return _res

        # 检测消耗英雄
        for idx, tid in enumerate(_tidList):
            _heroInfo = g.m.herofun.getHeroInfo(uid, tid)
            # 英雄不存在
            if not _heroInfo:
                _res['s'] = -4
                _res['errmsg'] = g.L('global_heroerr')
                return _res
            if _heroInfo['islock']:
                _res['s'] = -5
                _res['errmsg'] = g.L('hero_lock_res_-1')
                return _res
            # 英雄不满足条件
            _need = _con[_needKeys[idx]]
            if str(_need['hid']) != _heroInfo['pinglunid']:
                _res['s'] = -6
                _res['errmsg'] = g.L('global_valerr')
                return _res
            if _need['cond'] == 'gte' and _heroInfo['star'] < _need['star']:
                _res['s'] = -7
                _res['errmsg'] = g.L('global_valerr')
                return _res
            if _need['cond'] == 'eq' and _heroInfo['star'] != _need['star']:
                _res['s'] = -8
                _res['errmsg'] = g.L('global_valerr')
                return _res

        _mainHero = g.m.herofun.getHeroInfo(uid, _tidList[0])
        _delHero = g.m.herofun.getHeroInfo(uid, _tidList[1])
        _heroList = [_delHero, _mainHero]

        # 检测删除英雄是否有皮肤
        g.event.emit("chkdelhero_skin", uid, _heroList)
        _delHeroList = map(lambda x: str(x['_id']), _heroList)
        g.mdb.delete('hero', {'uid': uid, '_id': {'$in': map(g.mdb.toObjectId, _delHeroList)}})

        # 扣除道具
        _delData = g.delNeed(uid, _needItem,0, logdata={'act': 'csdt_duanzhao', 'hid': _id})
        # 删掉金币
        # if "attr" in _delData and "jinbi" in _delData["attr"]:
        #     del _delData["attr"]["jinbi"]
        g.sendChangeInfo(conn, _delData)

        # 返回分解英雄的奖励信息
        _prize = g.m.herofun.getFenjiePrize(uid, [_delHero], isfenjie=False)

        # 锻造分解获得内容N
        _prize['prize'].extend(list(_con['getitem']))

        # 通过穿戴信息修改数据库
        _logData = {'act': 'csdt_duanzhao', 'prize': _prize, 'deleteid': map(lambda x: str(x['_id']), _heroList),
                    'get': _id, 'delete': map(lambda x: x['hid'], _heroList)}
        _sendData = g.getPrizeRes(uid, _prize['prize'], act=_logData)
        for sp in _prize['shipin']:
            _data = g.m.shipinfun.changeShipinNum(uid, sp['t'], sp['n'])
            _sendData['shipin'].update(_data)

        for equip in _prize['equip']:
            _data = g.m.equipfun.updateEquipInfo(uid, equip['t'], {'$inc': {'usenum': -equip['n']}})
            _sendData['equip'].update(_data)

        _delHeroList = {i: {'num': 0} for i in _delHeroList}

        _wearData = _mainHero.get('weardata', {})
        _msInfo = _mainHero.get('extbuff', {}).get('meltsoul', [])
        data = {
            'lv': _mainHero['lv'],
            'star': _mainHero['star'],
            'dengjielv': _mainHero['dengjielv'],
            'dengjie': _mainHero['dengjie'],
            'weardata': _wearData,
            'extbuff': {'meltsoul': g.m.herofun.getMSbuff(_con['gethero']['hid'], _msInfo, _mainHero.get('meltsoul', 1)), 'glyph': _mainHero.get('extbuff', {}).get('glyph', [])},
            'meltsoul': _mainHero.get('meltsoul', 1),
            'islock': _mainHero['islock'],
            'jiban': _mainHero.get("jiban", ""),
            'glyph': _mainHero.get('glyph', {})
        }
        _newHero = g.m.herofun.addHero(uid, _con['gethero']['hid'], data=data)

        # 判断是否有羁绊
        if _mainHero.get("jiban", ""):
            data = g.m.jibanfun.getJiBanData(uid, _mainHero["jiban"])
            _uphero = data["uphero"]
            gud = g.getGud(uid)
            _uphero[_newHero["tid"]] = {"pos": _uphero[_tidList[0]]["pos"], "isext": 0,
                                        "star": _newHero["herodata"]["star"], "name": gud["name"],
                                        "hid": _newHero["herodata"]["hid"], "tid": _newHero["tid"]}
            del _uphero[_tidList[0]]
            # 设置羁绊
            g.m.jibanfun.setJiBanData(uid, _mainHero["jiban"], {"uphero": _uphero})
            # 检查羁绊
            g.event.emit("chkjiban", uid, _newHero["tid"], _newHero["herodata"]["star"], _newHero["herodata"]["hid"])

        # 如果英雄在派遣列表就更新里面的数据
        _dispatchData, name = g.m.jibanfun.getDispatchHero(uid)
        if _tidList[0] in _dispatchData:
            # 获取旧英雄的数据
            _oldData = _dispatchData[_tidList[0]]
            # 删除旧英雄数据
            del _dispatchData[_tidList[0]]
            # 更新英雄数据
            _oldData.update({"hid": _id, "tid": _newHero["tid"], "star": _newHero["herodata"]["star"]})
            _dispatchData[_newHero["tid"]] = _oldData
            g.m.jibanfun.setDispatchHero(uid, _dispatchData)

        g.m.userfun.setMaxZhanli(uid, _newHero['maxzhanli'])
        # 设置新英雄的信息
        # 历史最高战力改变,防止分解其中一个给另一个升星  导致最高战力继续上涨
        _zlData = g.m.sess.get(uid, 'USER_TOPZHANLIHERO')
        if _zlData:
            for tid in _delHeroList:
                if tid in _zlData['tid2zhanli']:
                    g.m.sess.remove(uid, 'USER_TOPZHANLIHERO')
                    break

        _heroBuff = g.m.herofun.reSetHeroBuff(uid, _newHero['tid'])
        _heroBuff[_newHero['tid']].update(_wearData)
        _heroBuff[_newHero['tid']].update(_newHero['herodata'])
        _sendData['hero'].update(_delHeroList)
        _sendData['hero'].update(_heroBuff)

        g.sendChangeInfo(conn, _sendData)

        # 如果主英雄在竞技场就要替换
        _defHero = g.m.zypkjjcfun.getDefendHero(uid)
        for pos, tid in _defHero.items():
            if tid == _tidList[0]:
                g.mdb.update('zypkjjc', {'uid': uid}, {'defhero.{}'.format(pos): _newHero['tid']})
                _defHero[pos] = _newHero['tid']
                break

        # 继承主英雄的融魂消耗
        g.mdb.update('playattr', {'uid': uid, 'ctype': 'meltsoul_cost', 'k': _tidList[0]}, {'k': _newHero['tid']})
        _heroStar = g.GC['pre_hero'][_id]['star']
        # # 跑马灯
        # if _heroStar >= 6:
        #     gud = g.getGud(uid)
        #     _heroCon = g.GC['hero'][_id]
        #     g.m.chatfun.sendPMD(uid, 'hechenghero', *[gud['name'], _heroStar, _heroCon['name']])

        # 养成礼包
        if _heroStar in (5, 6):
            g.event.emit('GIFT_PACKAGE', uid, 'yangchenglibao', _heroStar)
            # 开服狂欢活动
            # 合成N星英雄
            g.event.emit('kfkh', uid, 23, 7, cond=_heroStar)
            # 开服狂欢获得N星英雄
            g.event.emit('kfkh', uid, 20, 5, cond=_heroStar)
            # 统御
            g.event.emit("hero_tongu", uid, _con['gethero']['hid'])

        # 增加名将绘卷列表
        g.event.emit("addmjhj", uid, _con['gethero']['hid'], 1)

        # 监听获取英雄成就任务
        g.event.emit("gethero", uid, _con['gethero']['hid'])

        g.event.emit('GJherofenjie', uid)
        # 神器任务
        g.event.emit('artifact', uid, 'ronghe', cond=_heroStar)
        g.event.emit('trial', uid, '1', cond=_heroStar)

        g.event.emit('herotheme_star', uid, _con['gethero']['hid'], val=_heroStar)
        # 检测头像信息
        g.event.emit("adduserhead", uid, [str(_id)])
        _resPrize = []
        for i in _prize:
            _resPrize += _prize[i]

        _res['d'] = {'heroprize': {'a': 'hero', 't': _id, 'n': 1}, 'itemprize': _resPrize, 'defhero': _defHero}
        # 检查是否有羁绊buff
        g.m.jibanfun.chkJiBanHero(uid, _delHeroList, conn, herodata=[_delHero])

    # 物品锻造
    else:
        # 道具消耗不足
        _needItem = list(_con['itemneed'])
        _num = data[2]
        _needItem = [{'a': i['a'], 't': i['t'], 'n': i['n'] * _num} for i in _con['itemneed']]
        _chk = g.chkDelNeed(uid, _needItem)
        # 判断消耗品是否充足
        if not _chk['res']:
            if _chk['a'] == 'attr':
                _res['s'] = -100
                _res['attr'] = _chk['t']
            else:
                _res["s"] = -104
                _res[_chk['a']] = _chk['t']
            return _res

        _delData = g.delNeed(uid, _needItem, logdata={'act': 'csdt_duanzhao', 'itemid': _id})

        _prize = [{'a': i['a'], 't': i['t'], 'n': i['n'] * _num} for i in _con['getitem']]
        _sendData = g.getPrizeRes(uid, _prize, act={'act': 'csdt_duanzhao', 'num': _num})

        g.mergeDict(_sendData, _delData)
        g.sendChangeInfo(conn, _sendData)

        _res['d'] = {'itemprize': _prize}

    return _res


if __name__ == '__main__':
    from pprint import pprint
    uid = g.buid("yifei66")
    g.debugConn.uid = uid
    a = doproc(g.debugConn, ['herodz', 71016, ['61c1fd1e9dc6d67982fdae0e', '61c1fd1e9dc6d67982fdae0f']])
    pprint(a)
    # _type = 'herodz'
    # _id = '61035'
    # _con = g.m.csdtfun.getCon(_type, _id)
    # print list(_con['gethero'])