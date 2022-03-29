#!/usr/bin/env python
#coding:utf-8

'''
    @author      : gch
    @date        : 2017-02-16
    @description : 
        大乱斗晋级钻石赛玩家发奖
        
'''
import sys
if __name__ == '__main__':
    sys.path.append('..')
    
import g

@g.timerretry
def proc(conn, data):
    # 检查上一步是否完成，如果未完成则延迟执行
    # 如果已经执行过，则跳过
    # 本周活动未开启
    _ifopen = g.m.crosswzfun.isWangZheOpen()
    if not _ifopen: return
    _laststep = g.m.crosswzfun.getWangZheStep()
    _con = g.m.crosswzfun.getCon()
    _actlist = [x['act'] for x in _con['event']]
    if _laststep not in _actlist: return
    _step = 0
    _thisstep = 'daluandoujinjiprize'
    _thisidx = _actlist.index(_thisstep)
    _lastidx = _actlist.index(_laststep)
    # 前置步骤未完成，则报错重试
    if _lastidx + 1 < _thisidx:
        print "previous step:{0} is not done, timer will do nothing.".format(_actlist[_lastidx])

    elif _lastidx + 1 == _thisidx:
        g.m.crosswzfun.act_giveDldJinjiPrize()

    # 已经执行过
    else:
        print '{0} is already excuted, timer will do nothing.'.format(_thisstep)

    return

if __name__ == '__main__':
    g.debugConn.uid = g.buid('gch')
    proc(g.debugConn,[])
