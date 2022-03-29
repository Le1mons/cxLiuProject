#coding:utf-8
#!/usr/bin/python

'''
    活动 - 每天发送每日首充未领取奖励
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
import g

def proc(arg,karg):
    print 'mrsc_sendprize start ...'
    _time = g.C.NOW()
    _con = g.GC['meirishouchong']
    _scData = g.mdb.find('playattr',{'ctype':'meirishouchong','v':{'$gte':_con['val']}},fields=['uid','v','receive'])
    _title = _con['email']['title']
    _content = _con['email']['content']
    _tidList = []
    for i in _scData:
        uid = i['uid']
        _prize = []
        for idx,ele in enumerate(_con['data'][g.m.shouchongfun.getKey(True)]):
            if idx not in i.get('receive', []) and i['v'] >= ele['val']:
                _prize += ele['prize']
        if _prize:
            g.m.emailfun.sendEmails([uid], 1, _title, _content, g.fmtPrizeList(_prize))
        _tidList.append(i['_id'])

    if not _tidList:
        print 'no tidlist'
        return

    g.mdb.update('playattr', {'ctype': 'meirishouchong','_id':{'$in':_tidList}},{'receive':[0,1]})
    print 'mrsc_sendprize finished ...'

if __name__ == '__main__':
    proc(1,2)