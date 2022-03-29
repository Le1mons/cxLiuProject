#coding:utf-8
#!/usr/bin/python

'''
    自由竞技场 - 每天21点保存数据 五分钟后发奖
    功能：
    1， 根据排名发送每日奖励
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
import g

def proc(arg,karg):
    print 'zypkjjc_dayprize start ...'
    _nt = g.C.NOW()
    _w = {'ctype': 'zypkjjc_rank', 'k': g.C.DATE(_nt)}
    _data = g.mdb.find1('gameconfig', _w, fields={'_id': 1})
    # 如果数据已存在 或者 时间不到晚上9点 或者是同一天
    if _data or g.C.HOUR() != 21:
        print 'data:{0} hour:{1} nt:{2}'.format(bool(_data), g.C.HOUR(), _nt)
        return

    _allUser = g.mdb.find('zypkjjc', sort=[['jifen', -1], ['zhanli', -1]],fields=['_id','uid','jifen'])
    g.mdb.update('gameconfig', {'ctype': 'zypkjjc_rank'}, {'v':_allUser,'lasttime':_nt,'k': g.C.DATE(_nt)},upsert=True)
    print 'zypkjjc_dayprize finished ...'

if __name__ == '__main__':
    proc(1,2)