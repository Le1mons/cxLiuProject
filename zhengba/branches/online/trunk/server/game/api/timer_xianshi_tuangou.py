#coding:utf-8
#!/usr/bin/python

'''
    限时团购 - 发送没有领取的奖励奖励
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
import g

def proc(arg,karg):
    print 'xianshi_tuangou start ...'
    _time = g.C.NOW() - 24 * 3600
    # 限时团购的htype
    _htype = 17
    _hdinfo = g.mdb.find1('hdinfo',{'rtime':{'$lte':_time},'etime':{'$gte':_time},'htype':_htype},fields=['_id','hdid','data','email'])
    # 活动不存在
    if not _hdinfo:
        return

    hdid = _hdinfo['hdid']

    # 奖励已经发过
    if g.mdb.find1('gameconfig',{'ctype':'xianshi_tuangou','hdid':hdid}):
        return
    _crossData = g.crossDB.find1('cross_hddata', {'uid': 'SYSTEM', 'hdid': hdid})
    _allUser = g.mdb.find('hddata',{'hdid':hdid,'receive':0},fields=['_id','val','uid'])
    _res = {}
    for i in _allUser:
        if not i['val']:
            continue
        _prize = g.m.huodongfun.getCashBackPrize(i['val'],_crossData['arr'])
        if _prize[0]['n'] <= 0:
            continue
        _res[i['uid']] = _prize

    _setData = {
        'v':_res,
        'ctime':g.C.NOW(),
        'hdid':hdid
    }
    g.mdb.update('gameconfig',{'ctype':'xianshi_tuangou'},_setData)
    # 发送奖励
    _title = _hdinfo['email']['title']
    _content = _hdinfo['email']['content']
    for uid,prize in _res.items():
        gud = g.getGud(uid)
        _perContent = g.C.STR(_content, gud['name'])
        g.m.emailfun.sendEmails([uid], 1, _title, _perContent, prize)
        g.m.huodongfun.setMyHuodongData(uid,hdid,{'$set':{'receive':1}})
    print 'xianshi_tuangou finished ...'

if __name__ == '__main__':
    proc(1,2)