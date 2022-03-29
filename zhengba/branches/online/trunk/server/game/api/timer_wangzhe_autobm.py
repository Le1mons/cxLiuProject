#!/usr/bin/python
# coding:utf-8
if __name__ == '__main__':
    import sys
    sys.path.append('..')
    sys.path.append('./game')
import g
'''巅峰王者-自动报名'''


@g.timerretry
def proc(arg,karg):
    print 'start auto baoming'
    _sTime = g.m.crosswzfun.getStatusTime(0)
    _nt = g.m.crosswzfun.now()
    # 只有在状态1或者状态1的前60s报名
    if not (_sTime['stime'] - 60 <= _nt <= _sTime['etime']):
        return

    # 获取自动报名uid
    _nt = g.m.crosswzfun.now()
    if _nt <= _sTime['stime']:
        _nt += 60

    _dkey = g.C.getWeekNumByTime(_nt)
    _uidList = g.m.crosswzfun.getAutoBMList()
    # 获取开启自动报名并且已经报名的uid
    _bmUser = g.crossDB.find('wzbaoming', {'uid': {'$in': _uidList}, 'dkey': _dkey}, fields=['_id', 'uid'])
    _bmUser = [_tmp['uid'] for _tmp in _bmUser]
    # 开启自动报名且未报名的uid
    _uid = [_tmp for _tmp in _uidList if _tmp not in _bmUser]
    if len(_uid) <= 0:
        # 没有符合要求的玩家
        print 'no data'
        return

    # 查找上届报名信息
    _pBmInfo = g.crossDB.find('wzbaoming', {'uid': {'$in': _uid}}, fields=['uid', 'curzhanli', 'zhanli'])

    _ttlTime = g.C.UTCNOW()
    # 生成邮件基本信息
    _emailTxt = g.m.crosswzfun.getCon()['email']['dldbaoming']
    _emailData = {
        'uid': '',
        'ctime': _nt,
        'etype': 1,
        'ttltime': _ttlTime,
        'isread': 0,
        'passtime': _nt + 15 * 24 * 3600,
        'getprize': 0,
        'title': _emailTxt['title'],
        'content': _emailTxt['content']
    }
    con = g.GC['crosswz']
    if 'bmprize' in con and con['bmprize']:
        _prize = con['bmprize']
        _emailData['prize'] = _prize

    _data = []
    _email = []
    # 生成报名表数据
    upUid = {t['uid']: {'maxzhanli': t['zhanli'], 'zhanli': t['curzhanli']} for t in _pBmInfo}
    uidToTid = {t['uid']: t['_id'] for t in _pBmInfo}
    _idList = uidToTid.values()
    for _user in upUid:
        # 上传玩家数据至跨服服务器
        g.m.crosswzfun.uploadUserData(_user, upUid[_user])
        _emailData.update({'uid': _user})
        _email.append(_emailData.copy())
    # 更新报信息
    g.crossDB.update('wzbaoming', {'_id': {'$in': _idList}}, {'dkey': _dkey, 'ttltime': _ttlTime, 'jifen': 0, 'fightdata': [], 'renum': 0, 'touid': ''})
    # 发送邮件
    if _email:
        g.mdb.insert('email', _email)
    print 'Done!'


if __name__ == '__main__':
    proc(0, 0)