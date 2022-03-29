#!/usr/bin/python
# coding:utf-8
if __name__ == '__main__':
    import sys
    sys.path.append('..')
    sys.path.append('./game')
import g
'''巅峰王者'''


def proc(conn, data):
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()


# 判断用户uid是否存在
@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    gud = g.getGud(uid)
    con = g.GC['crosswz']
    _con = con['bmneed']
    if gud['lv'] < _con['lv']:
        # 等级不足
        _res['s'] = -1
        _res['errmsg'] = g.L('wangzhe_autobm_-1')
        return _res

    if gud['vip'] < _con['vip']:
        _res['s'] = -2
        _res['errmsg'] = g.L('wangzhe_autobm_-2')
        return _res

    # 获取玩家自动报名状态
    _status = g.m.crosswzfun.getAutoBMStatus(uid)
    _nowStatus = not _status
    g.m.crosswzfun.setAutoBMStatus(uid, _nowStatus)
    if _nowStatus:
        # 获取阶段时间
        _sTime = g.m.crosswzfun.getStatusTime(0)
        _nt = g.m.crosswzfun.now()
        # 只有在状态1或者状态1的前60s报名
        if _sTime['stime'] - 60 <= _nt <= _sTime['etime']:
            if _nt <= _sTime['stime']:
                _nt += 60
            _dkey = g.C.getWeekNumByTime(_nt)
            _userData = g.crossDB.find1('wzbaoming', {'uid': uid}, fields=['_id', 'uid', 'dkey', 'herodata', 'zhanli', 'curzhanli'], sort=[['ctime', -1]])
            if not _userData or _userData['dkey'] != _dkey:
                _fightData = []
                _zhanli = 0
                _curZhanli = 0
                if _userData:
                    _fightData = _userData['herodata']
                    _zhanli = _userData['zhanli']
                    _curZhanli = _userData['curzhanli']
                else:
                    if (not data) or len(data[0]) < 3:
                        _res['s'] = -4
                        _res['errmsg'] = g.L('wangzhe_baoming_nodef')
                        return _res

                    for fgroup in data[0]:
                        if not (fgroup and [t for t in fgroup if t != 'sqid']):
                            _res['s'] = -5
                            _res['errmsg'] = g.L('wangzhe_baoming_nodef')
                            return _res

                        _chkRes = g.m.fightfun.chkFightData(uid, fgroup)
                        if _chkRes['chkres'] < 1:
                            _res['s'] = _chkRes['chkres']
                            _res['errmsg'] = g.L(_chkRes['errmsg'])
                            return _res
                        _zhanli += _chkRes['zhanli']
                        _tmpFightData = g.m.fightfun.getUserFightData(uid, _chkRes['herolist'], 0, sqid=fgroup.get('sqid'))
                        _fightData.append(_tmpFightData)
                    _curZhanli = _zhanli

                # 玩家没有报名，此处执行报名逻辑
                _data = {
                    'uid': uid,
                    'dkey': _dkey,
                    'ctime': g.m.crosswzfun.now(),
                    'zhanli': _zhanli,
                    'curzhanli': _curZhanli,
                    'jifen': 0,
                    'herodata': _fightData,
                    'fightdata': [],
                    'renum': 0,
                    'ttltime': g.C.UTCNOW()
                }
                # 将玩家信息上传至跨服服务器
                g.m.crosswzfun.uploadUserData(uid, zldata={'zhanli': _curZhanli, 'maxzhanli': _zhanli})
                # 写入报名数据
                g.crossDB.insert('wzbaoming', _data)
                # 发送奖励邮件
                if 'bmprize' in con and con['bmprize']:
                    _prize = con['bmprize']
                    _emailTxt = g.m.crosswzfun.getCon()['email']['dldbaoming']
                    g.m.emailfun.sendEmail(uid, 1, _emailTxt['title'], _emailTxt['content'], _prize)
    _res['d'] = {'iszdbm': int(_nowStatus)}
    return _res
