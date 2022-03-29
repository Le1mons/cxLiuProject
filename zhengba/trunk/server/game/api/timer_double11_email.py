# coding:utf-8
# !/usr/bin/python

'''
    双11——邮件提醒
'''

if __name__ == "__main__":
    import sys

    sys.path.append("..")
import g


def proc(arg, karg):
    print 'double11_email start ...'
    _hd = g.m.huodongfun.getHDinfoByHtype(66)
    # 活动还没开  过了抽奖的时间
    if not _hd or 'hdid' not in _hd:
        return

    _con = g.GC['double11']
    for i in ('exchange', 'prizepool'):
        # 最后一天才发
        if g.C.getDateDiff(_hd['stime'], g.C.NOW()) + 1 == _con['openday'][i][1]:
            break
    else:
        return

    _email = {
        "uid": "SYSTEM",
        "title": _con['email'][i]['title'],
        "content": _con['email'][i]['content'],
        "etype": '1'
    }
    g.m.emailfun.sendEmail(**_email)
    print 'double11_email finished ...'


if __name__ == '__main__':
    proc(1, 2)
