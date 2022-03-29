#!/usr/bin/python
# coding:utf-8
'''
许愿池--抽奖
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g


def proc(conn, data):
    """

    :param conn:
    :param data: [许愿池类型:str. 抽奖次数:int, 是否超级许愿池:bool]
    :return:
    ::

        {'d': {
            'prizelist':[]
            'shopitem':许愿池信息 open界面
        },
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 许愿池名字
    _poolname = data[0]
    # 抽奖次数
    _num = int(data[1])
    # 是否是超级许愿池
    _super = int(data[2])
    # 不能为负数
    if _num <= 0:
        _res['s'] = -7
        _res['errmsg'] = g.L('xuyuanchi_lottery_res_-1')
        return _res
    
    
    gud = g.getGud(uid)
    _vip = gud['vip']
    _lv = gud['lv']

    _lvCon = g.GC['opencond']['base']['xuyuanchi']['main']
    # 判断等级是否足以开启
    if _poolname == 'common':
        _lvLimit = _lvCon[0][1]
        if _lv < _lvLimit:
            _res['s'] = -2
            _res['errmsg'] = g.L('xuyuanchi_lottery_res_-4')
            return _res
    else:
        _lvLimit = _lvCon[1][1]
        _vipLimit = _lvCon[2][1]

        if _lv < _lvLimit and _vip < _vipLimit:
            _res['s'] = -3
            _res['errmsg'] = g.L('xuyuanchi_lottery_res_-5')
            return _res

    # 次数参数错误
    _con = g.m.xuyuanchifun.getXYCcon(_poolname)
    if _num not in (1, _con['duochoucishu']):
        _res['s'] = -1
        _res['errmsg'] = g.L('xuyuanchi_lottery_res_-1')
        return _res

    _xycInfo = g.m.xuyuanchifun.getXuyuanchiData(uid, _poolname)
    # 超级许愿池 没有信息
    if _super and not _xycInfo.get('super'):
        _res['s'] = -10
        _res['errmsg'] = g.L('global_argserr')
        return _res
    
    if 'super' in _xycInfo:
        _super = 1
        _num = 1        
    
    # 普通抽奖
    if not _super:
        _need = _con['oneneed']
        # 如果是多抽
        if _num == _con['duochoucishu']:
            # vip等级不足
            # if _vip < 2 and _lv < 80:
            #     _res['s'] = -3
            #     _res['errmsg'] = g.L('xuyuanchi_lottery_res_-3')
            #     return _res

            _need = _con['tenneed']

        _chk = g.chkDelNeed(uid, _need)
        # 材料不足
        if not _chk['res']:
            if _chk['a'] == 'attr':
                _res['s'] = -100
                _res['attr'] = _chk['t']
            else:
                _res["s"] = -104
                _res[_chk['a']] = _chk['t']
            return _res

        _sendData = g.delNeed(uid, _need,issend=False,logdata={'act': 'xuyuanchi_lottery'})
        g.sendChangeInfo(conn, _sendData)

    _shopItem = _xycInfo['shopitem']
    # 获取抽奖信息
    _prizeList, _jiluList = g.m.xuyuanchifun.getLotteryData(uid, _num, _shopItem, _xycInfo.get('afternum'))

    _jifenPrize = []
    # 获取普通的许愿积分奖励
    if _poolname != 'high':
        _jiFen = _con['prize']
        _jifenPrize = [{"a":i['a'],"t":i['t'],"n":i['n']*_num} for i in _jiFen]
        # 2018-11-23 周宝箱次数
        g.setAttr(uid,{'ctype': 'xuyuanchi_cishu', 'k': g.C.getWeekNumByTime(g.C.NOW())},{'$inc':{'v':_num}})
        # 神器任务
        g.event.emit('artifact', uid, 'xuyuan',val=_num)

    # 获取奖励
    _sendData = g.getPrizeRes(uid,_prizeList+_jifenPrize,act={'act':'xuyuanchi_lottery','prize':_prizeList,'super':_super,'pool':_poolname})
    g.sendChangeInfo(conn, _sendData)

    if not _super:
        # 2018-11-23 增加能量
        g.setAttr(uid, {'ctype': 'xuyuanchi_integral'}, {'$inc': {'v.{}'.format(_poolname): _num}})
        g.m.xuyuanchifun.updateXYCinfo(uid, _poolname,{'$set':{'shopitem':_shopItem},'$inc':{'afternum':_num}})
    else:
        g.mdb.delete('playattr', {'uid': uid, 'ctype': 'xuyuanchi_super{}'.format(_poolname)})

    # 如果记录表不为空
    if _jiluList:
        g.m.xuyuanchifun.setXYCjilu(uid, _poolname, _jiluList)
        g.m.mymq.sendAPI(uid, 'xuyuanchi_grandprize', '1')

    # 开服狂欢活动
    g.event.emit('kfkh', uid,22,6,len(_prizeList))
    # 新年任务
    g.event.emit('newyear_task', uid, '5', _num)
    # 节日狂欢
    g.event.emit('jierikuanghuan', uid, '12' if _poolname == 'common' else '13', _num)

    _res['d'] = {'prizelist': _prizeList, 'shopitem': _xycInfo['shopitem']}
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['common',15,0])