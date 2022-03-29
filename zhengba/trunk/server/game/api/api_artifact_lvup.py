#!/usr/bin/python
# coding:utf-8
'''
神器 - 升级
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g



def proc(conn, data):
    """

    :param conn:
    :param data: [神器号码:str, 升级类型:str(lv,djlv,jxlv,rank)]
    :return:
    ::

        {'d': {lv:0,djlv:0,jxlv:0,rank:0}
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


@g.apiCheckLogin
def doproc(conn, data):
    _res = {"s": 1}
    uid = conn.uid
    # 神器的章节
    _zj = str(data[0])
    # 升级类型
    _type = data[1]
    # 参数有误
    if _type not in ('lv', 'djlv', 'jxlv','rank'):
        _res['s'] = -5
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _artifactInfo = g.m.artifactfun.getArtifactInfo(uid)
    # 神器不存在
    if not _artifactInfo:
        _res['s'] = -1
        _res['errmsg'] = g.L('artifact_lvup_res_-1')
        return _res

    _artifactDict = _artifactInfo['artifact']
    # 神器未激活
    if _zj not in _artifactDict:
        _res['s'] = -2
        _res['errmsg'] = g.L('artifact_lvup_res_-2')
        return _res

    _con = g.GC['shenqicom']
    _comCon = _con['shenqi'][_zj]
    # 获取是否开启共鸣
    _isResonance = g.m.artifactfun.getResonance(uid)
    if _type == 'lv':
        _curLV = _artifactDict[_zj]['lv']
        # 最大等级要加上神器共鸣提供的
        _maxLv = _comCon['maxlv']
        if 'djlvsum' in _artifactInfo and _artifactInfo['djlvsum'] - _con['base']['resonance']['lv'] > 0 \
                and _isResonance:
            _maxLv += (_artifactInfo['djlvsum'] - _con['base']['resonance']['lv']) // _con['base']['resonance']['modulus']

        # 升至最大等级
        if _curLV >= _maxLv:
            _res['s'] = -3
            _res['errmsg'] = g.L('artifact_lvup_res_-3')
            return _res

        _need = _con['base']['lvneed'][_con['shenqi'][_zj]['lvuptype']][str(_curLV)]
    elif _type == 'jxlv':
        _curLV = _artifactDict[_zj].get('jxlv', 0)
        # 等级不足
        if _artifactDict[_zj].get('rank',0) < _con['base']['wake'][_con['shenqi'][_zj]['waketype']][str(_curLV+1)]['rank']:
            _res['s'] = -5
            _res['errmsg'] = g.L('global_limitlv')
            return _res

        # 已升至最大级
        if str(_curLV+1) not in _con['base']['wake'][_con['shenqi'][_zj]['waketype']]:
            _res['s'] = -3
            _res['errmsg'] = g.L('artifact_lvup_res_-3')
            return _res

        _need = list(_con['base']['wake'][_con['shenqi'][_zj]['waketype']][str(_curLV+1)]['need'])
        _need.append({'a': 'item', 't': _con['shenqi'][_zj]['needitem'], 'n': _con['base']['wake'][_con['shenqi'][_zj]['waketype']][str(_curLV+1)]['itemnum']})
    elif _type == 'rank':
        _curLV = _artifactDict[_zj].get('rank', 0)
        # 进阶至满级
        if str(_curLV + 1) not in _con['wakerank']:
            _res['s'] = -50
            _res['errmsg'] = g.L('artifact_lvup_res_-50')
            return _res

        # 等级不足
        if _artifactDict[_zj]['lv'] < _con['wakerank'][str(_curLV + 1)]['lv']:
            _res['s'] = -30
            _res['errmsg'] = g.L('global_limitlv')
            return _res

        # 觉醒等级不足
        if _artifactDict[_zj].get('jxlv',0) < _con['wakerank'][str(_curLV + 1)]['jxlv']:
            _res['s'] = -31
            _res['errmsg'] = g.L('artifact_lvup_-31')
            return _res

        _need = list(_con['wakerank'][str(_curLV + 1)]['need'])
        _need.append({'a': 'item', 't': _con['shenqi'][_zj]['needitem'], 'n': _con['wakerank'][str(_curLV + 1)]['itemnum']})
    else:
        _curLV =_artifactDict[_zj]['djlv']
        _maxLv = _comCon['maxdengjie']
        _module = _comCon['lv2dengjie']
        # 升至最大等级
        if _artifactDict[_zj]['lv'] // _module <= _curLV:
            _res['s'] = -4
            _res['errmsg'] = g.L('artifact_lvup_res_-4')
            return _res

        _need = _con['base']['dengjieneed'][_con['shenqi'][_zj]['lvuptype']][str(_curLV)]

    _curLV += 1
    _artifactDict[_zj][_type] = _curLV
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

    _sendData = g.delNeed(uid, _need,logdata={'act': 'artifact_lvup','type':_type})
    g.sendChangeInfo(conn, _sendData)

    _set = {'$set': {g.C.STR('artifact.{1}.{2}',_zj,_type): _curLV}}

    _artifactInfo["artifact"][_zj][_type] = _curLV
    # 如果是觉醒 需要重算buff
    if _type in ('jxlv', 'rank'):
        _jxbuff = _con['base']['wake'][_con['shenqi'][_zj]['waketype']][str(_artifactDict[_zj].get('jxlv',0))]['buff']
        _buff = _con['wakerank'][str(_artifactDict[_zj].get('rank',0))]['buff']
        g.mergeDict(_buff, _jxbuff, 1)
        g.m.userfun.setCommonBuff(uid, {'buff.artifact.{}'.format(_zj): _buff})
        _r = g.m.herofun.reSetAllHeroBuff(uid, {'lv': {'$gt': 1}}) or {}
        g.sendChangeInfo(conn, {'hero': _r})
    # # 检查神器共鸣
    # elif _type == 'djlv':
    #     # _rLv = len(g.GC['shenqiskill']['1']) - 1
    #     # _rLv = _con["base"]['resonance']['actdjlv']
    #     # # 满足三个
    #     # if 'djlvsum' not in _artifactInfo and len([i for i in _artifactDict if _artifactDict[i]['djlv']>=_rLv]) >= _con['base']['resonance']['num']:
    #     #     # 所有神器之和
    #     #     _set['$set']['djlvsum'] = sum(_artifactDict[i]['djlv'] for i in _artifactDict)
    #     # # 升级
    #     # elif 'djlvsum' in _artifactInfo:
    #     #     _set['$inc'] = {'djlvsum': 1}

    # 检查是否开启共鸣
    if _type == 'djlv' and not _isResonance:
        g.m.artifactfun.chkResonance(uid, _artifactInfo)

    if _type == 'djlv':
        g.event.emit('trial', uid, '2', val=_curLV)

    g.m.artifactfun.setArtifactInfo(uid, _set)
    _artifactDict[_zj].update({_type: _curLV})
    # 如果是技能等级提升，记录历史最大等级
    _res['d'] = _artifactDict[_zj]
    return _res

if __name__ == '__main__':
    g.mc.flush_all()
    uid = g.buid("lyf")
    g.getPrizeRes(uid, [{"a": "attr", "t": "jinbi", "n": 1000000000000}, {"a": "item", "t": "2043", "n": 100000}])
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=[5,'djlv'])