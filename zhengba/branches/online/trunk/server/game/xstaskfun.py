#!/usr/bin/python
#coding:utf-8

'''
任务相关方法
'''
import g


#获取我的任务列表
def getMyTaskList(uid,keys='',where=None):
    _w = {"uid":uid}
    _options = {}
    if keys!='':
        _options["fields"] = keys.split(",")

    if where!=None:
        _w.update(where)

    _res = g.mdb.find("xstask",_w,**_options)
    return _res

#获取最大免费次数
def getMaxFreeNum(uid):
    _con = g.GC['xstaskcom']
    _maxNum = _con['maxrfnum']
    return _maxNum

# 获取玩家当天已经刷新的免费次数
def getRefreshNum(uid):
    _ctype = 'task_refresh'
    return g.getPlayAttrDataNum(uid,_ctype)

#设置玩家当天已经刷新的免费次数
def setRefreshNum(uid):
    _ctype = 'task_refresh'
    _data = g.getAttrByDate(uid,{'ctype':_ctype})
    if not _data:
        _freeNum = getMaxFreeNum(uid)
        g.setAttr(uid,{'ctype':_ctype},{'v':_freeNum-1})
    else:
        g.setPlayAttrDataNum(uid,_ctype)

# 获取花费刷新次数
def getCostRfNum(uid):
    _ctype = 'task_rmbrefresh'
    return g.getPlayAttrDataNum(uid,_ctype)

# 设置花费刷新次数
def setCostRfNum(uid):
    _ctype = 'task_rmbrefresh'
    return g.setPlayAttrDataNum(uid,_ctype)

#获取可以免费刷新的次数
def getCanRefNum(uid):
    _maxNum = getMaxFreeNum(uid)
    _refNum = getRefreshNum(uid)
    _resNum = _maxNum - _refNum
    if _resNum < 0: _resNum = 0
    return _resNum

#创建任务
def createTask(uid,colorArgs=None):
    color = []
    if colorArgs: color = colorArgs
    _xsTaskCon = g.GC['pre_xstask']
    _taskList = []
    _taskNum = g.GC['xstaskcom']['tasknum']
    _maxNum = _taskNum
    _nt = g.C.NOW()
    _data = {
        'ctime': _nt,
        'uid': uid,
        'finish':0,
        'isjiequ':0
    }
    # 玩家第一次打开赠送3个幸运币
    _firstOpen = g.getAttrOne(uid,{'ctype':'xstask_firstopen'})
    if not _firstOpen:
        color.append('3')
        g.setAttr(uid,{'ctype':'xstask_firstopen'},{'v':1})

    # 如果玩家有特权,就根据传进的参数随机一个
    _con = g.GC['pre_color2xstaskid']
    for i in color:
        _List = _con[i]
        _Task = g.C.RANDLIST(_List)
        _condNum = _Task[0]['cond']['zhongzu']
        _cond = getCondByNum(_condNum)
        # _Task[0]['cond']['zhongzu'] = _cond
        _data.update({'taskid':_Task[0]['taskid'],
                      'color': _Task[0]['color'],
                      'prize': _Task[0]['prize'],
                      'cond': {'star': _Task[0]['cond']['star'], 'zhongzu': _cond}})
        _taskList.append(_data.copy())
        _taskNum -= 1

    for i in xrange(_taskNum):
        _task = g.C.RANDARR(_xsTaskCon['list'],_xsTaskCon['base'])
        _condNum = _task['cond']['zhongzu']
        _starCond = _task['cond']['star']
        _cond = getCondByNum(int(_condNum))
        _data.update({
            'taskid':_task['taskid'],
            'color': _task['color'],
            'prize':_task['prize'],
            'cond':{'star':_starCond,'zhongzu':_cond}
        })
        _taskList.append(_data.copy())

    g.mdb.delete('xstask',{'uid':uid,'isjiequ': 0})
    #容错刷新
    _taskList = _taskList[0:_maxNum]
    g.mdb.insert('xstask',_taskList)
    _resList = g.mdb.find('xstask', {'uid':uid})

    return _resList

#是否第一次刷新任务
def isFirst(uid):
    _cacheKey = 'XSTAST_ISFIRSTREFTASK'
    _res = g.m.sess.get(uid,_cacheKey)
    if _res != None:
        return _res
        
    _where = {'ctype':'xstask_isfirstref'}
    _res = 0
    _data = g.getAttrOne(uid,_where)
    if _data == None:
        _res = 1
        g.setAttr(uid,_where,{'v':1})
            
    g.m.sess.set(uid,_cacheKey,0)
    return _res

# 获取单个悬赏任务信息
def getTaskInfo(uid, tid):
    _w = {'uid': uid, '_id': g.mdb.toObjectId(tid)}
    return g.mdb.find1('xstask', _w)

# 根据num获取一个随机种族条件先知
def getCondByNum(num):
    _con = list(g.GC['xstaskcom']['zhongzu'])
    _base = sum(map(lambda x:x['p'], _con))
    _res = []
    for i in xrange(num):
        _prize = g.C.RANDARR(_con,_base)
        _con.remove(_prize)
        _base = sum(map(lambda x: x['p'], _con))
        _res.append(int(_prize['name']))
    return _res

if __name__ == '__main__':
    uid = g.buid('666')
    print getCostRfNum(uid)
