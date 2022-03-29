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
    _scData = g.mdb.find('playattr',{'ctype':'meirishouchong','receive':{'$exists':0},'v':{'$gte':_con['val']}},fields=['uid'])
    _title = _con['email']['title']
    _content = _con['email']['content']
    _prize = _con['prize']
    _tidList = []
    for i in _scData:
        uid = i['uid']
        g.m.emailfun.sendEmails([uid], 1, _title, _content, _prize)
        _tidList.append(i['_id'])

    if not _tidList:
        print 'no tidlist'
        return

    g.mdb.update('playattr', {'ctype': 'meirishouchong','_id':{'$in':_tidList}},{'receive':1})
    print 'mrsc_sendprize finished ...'

if __name__ == '__main__':
    proc(1,2)