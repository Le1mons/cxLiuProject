#coding:utf-8
#!/usr/bin/python

'''
    双11——奖池邮件
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
import g

def proc(arg,karg):
    print 'double11_allowance start ...'
    _hd = g.m.huodongfun.getHDinfoByHtype(66)
    # 活动还没开  过了抽奖的时间
    if not _hd or 'hdid' not in _hd:
        return

    # 最后一天才发e
    if g.C.getDateDiff(_hd['etime'], g.C.NOW()) != 0:
        return

    _con = g.GC['double11']
    _title = _con['email']['allowance']['title']
    _insert = []
    _all = g.mdb.find('hddata',{'hdid':_hd['hdid'],'allowance':{'$ne':{}}},fields=['_id','allowance','uid'])
    for i in _all:
        _num = 0
        for idx, num in i['allowance'].items():
            _num += int(_con['libao'][int(idx)]['rmbmoney'] * num * 0.01 * _con['libao'][int(idx)]['pro'])

        if _num > 0:
            kwargs = {'title': _title, 'uid': i['uid'], 'prize': [{'a':'attr','t':'rmbmoney','n':_num}], 'content':_con['email']['allowance']['content'].format(_num)}
            _temp = g.m.emailfun.fmtEmail(**kwargs)
            _insert.append(_temp)

    if _insert:
        g.mdb.insert('email', _insert)

    g.mdb.update('hddata', {'hdid': _hd['hdid']}, {'allowance': {}})
    print 'double11_allowance finished ...'

if __name__ == '__main__':
    proc(1,2)