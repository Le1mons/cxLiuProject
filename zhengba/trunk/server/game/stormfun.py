#!/usr/bin/python
#coding:utf-8

'''
风暴战场模块
'''
import g

# 获取精力数量
def getEnergeNum(uid, getcd=0, isset=0):
    _where = {'ctype': 'storm_energenum'}
    _con = g.GC['storm']['base']
    _maxNum = _con['energy']['num']
    _cdSize = _con['energy']['cd']
    _data = g.getAttrOne(uid, _where)
    if not _data:
        # 初始数据
        _num = _maxNum
        _freeTime = 0
    else:
        # 当前数据，且计算cd增加数量
        _num = _data['v']
        _freeTime = _data['freetime']
        _nt = g.C.NOW()
        if _freeTime == 0:  _freeTime = _nt
        if _num < _maxNum:
            _defTime = _nt - _freeTime
            if _defTime >= _cdSize:
                _tmp = divmod(_defTime, _cdSize)
                _addNum = _tmp[0]
                _num = _num+ _addNum
                _freeTime += _addNum * _cdSize

    # 修正数据
    if _num >= _maxNum:
        _num = _maxNum
        _freeTime = 0

    # 写入数据
    if isset:
        g.setAttr(uid, _where, {'v': _num, 'freetime': _freeTime})

    _res = _num
    if getcd:
        # 需要cd的返回格式
        _res = {'freetime': _freeTime, 'num': _num}

    return _res


# 设置可挑战掠夺次数
def setEnergeNum(uid, addnum,ischk=1):
    _data = getEnergeNum(uid, 1, 1)
    _num = _data['num']
    _cd = _data['freetime']
    _cdSize = g.GC['storm']['base']['energy']['cd']
    _maxLDNum = g.GC['storm']['base']['energy']['num']
    _resNum = _num + addnum
    if ischk and (_resNum < 0 or (_resNum >= _maxLDNum and addnum <= 0)):
        # 不可为负数
        return

    _res = {'num': _resNum, 'freetime': _cd}
    if _resNum == _maxLDNum:  _res['freetime'] = 0
    _setData = {}
    _setData['v'] = _resNum
    if _cd == 0 and _resNum < _maxLDNum:
        _nt = g.C.NOW()
        _setData['freetime'] = _nt
        _res['freetime'] = _nt + _cdSize

    _key = 'storm_energenum'
    g.setAttr(uid, {'ctype': _key}, _setData)
    return _res

# 开启天降宝箱奖励
def timer_getBoxPrize():
    _res = {}
    _con = g.GC['storm']['base']
    _fortress = {}
    # 统计好可以随机的区域
    for c, item in _con['box'].items():
        for i in range(1, len(_con['region'])):
            i = str(i)
            for idx,color in enumerate(_con['region'][i]):
                if color not in item['p']:
                    continue

                if c in _fortress:
                    if color in _fortress[c]:
                        _fortress[c][color].append({'area':i, 'idx': idx, 'color':color})
                    else:
                        _fortress[c][color] = [{'area':i, 'idx': idx, 'color': color}]
                else:
                    _fortress[c] = {color: [{'area':i, 'idx': idx, 'color': color}]}

    # 从1品质开始随机
    for c in range(1, len(_con['box']) + 1):
        c = str(c)
        item = _con['box'][c]
        num = item['num']
        _break = False
        # 从统计好的fortress里按照从小到大的品质随机
        for i in sorted(_fortress[c].keys(), key=lambda x:int(x)):
            if _break: break
            # 每个区域的每条数据 {'area':地区，'idx':该地区的索引, 'color': 品质}
            for data in _fortress[c][i]:
                if not g.C.RAND(10000, _con['box'][c]['p'][data['color']]) or chkRepeat(data, _res):
                    continue
                addData(_res, c, data)
                num -= 1
                if num <= 0:
                    _break = not _break
                    break
        else:
            # 如果上面还没有随机到
            _boxNum = 0
            for _, lst in _res.get(c, {}).items():
                _boxNum += len(lst)
            if item['num'] > _boxNum:
                _boxNum = item['num'] - _boxNum
                _break = False
                # 逆序从大品质往小品质找
                for x in sorted(_fortress[c].keys(), key=lambda x:int(x), reverse=True):
                    if _break:
                        break
                    for data in _fortress[c][x][::-1]:
                        if chkRepeat(data, _res):
                            continue
                        addData(_res, c, data)
                        _boxNum -= 1
                        if _boxNum <= 0:
                            _break = not _break
                            break
    _data = {'v':_res,'stime':g.C.NOW(),'etime':g.C.NOW()+_con['act_time'],'lasttime':g.C.NOW()}
    g.mdb.update('gameattr',{'ctype':'storm_box','uid':'SYSTEM'},_data,upsert=True)
    g.mc.set('storm_boxdata', _data, _con['act_time'])
    # 删除红点依据
    g.mdb.delete('playattr', {'ctype': 'storm_firstlogin'})

def timer_sendBoxPrize():
    _box = g.mc.get('storm_boxdata')
    if not _box:
        _box = g.mdb.find1('gameattr',{'ctype':'storm_box','uid':'SYSTEM'},fields=['_id','v'])
        if not _box:
            return

    _nt = g.C.NOW()
    for color in _box['v']:
        for area,numbers in _box['v'][color].items():
            # 没有结束的 加上宝箱奖励
            g.mdb.update('storm',{'area':area,'number':{'$in':numbers},'over':{'$exists':0},'etime':{'$gt':_nt}},{'box':color,'lasttime':_nt})

    g.mc.delete('storm_boxdata')
    g.mdb.delete('gameattr', {'ctype': 'storm_box', 'uid': 'SYSTEM'})


# 检查是否重复
def chkRepeat(data, res):
    for _, temp in res.items():
        for area, lst in temp.items():
            if data['area'] == area and data['idx'] in lst:
                return True
    return False

# 添加数据
def addData(res, c, data):
    if c not in res:
        res[c] = {data['area']: [data['idx']]}
    elif data['area'] not in res[c]:
        res[c][data['area']] = [data['idx']]
    else:
        res[c][data['area']].append(data['idx'])

# 获取天降宝箱的数据
def getBoxData():
    _res = g.mc.get('storm_boxdata')
    if not _res:
        _res = g.mdb.find1('gameattr',{'ctype':'storm_box','uid':'SYSTEM'},fields=['_id','v','etime']) or {'v':{'1':{},'2':{},'3':{}}}
        g.mc.set('storm_boxdata', _res)
    return _res

# 获取风暴战场红点
def getStormHD(uid):
    # 等级不足
    if not g.chkOpenCond(uid, 'storm_1') or g.getOpenDay() <= 28:
        return 0

    # 有可以领取的挂机奖励
    _data = g.getAttrOne(uid, {'ctype': 'storm_gjtime'}, keys='_id,v,reclist') or {'v': 0}
    # 加上要结束得时间
    _myData = g.mdb.find('storm', {'uid': uid, 'over': {'$exists': 0}, 'etime':{'$lte':g.C.NOW()}},fields=['etime','stime','_id'])
    _data['v'] += sum(i['etime']-i['stime'] for i in _myData)
    for idx, i in enumerate(g.GC['storm']['base']['targetprize']):
        # 跳出循环
        if _data['v'] // 3600 < i[0]:
            break

        if idx not in _data.get('reclist', []):
            return 2

    # 有奖励可以被结算时
    if g.mdb.find1('storm',{'over': {'$exists': 0},'uid':uid,'etime':{'$lte':g.C.NOW()}}, fields={'lasttime':0}):
        return 1

    # 每天第一次登陆显示红点
    if not g.getAttrByDate(uid, {'ctype': 'storm_firstlogin'}):
        g.setAttr(uid, {'ctype': 'storm_firstlogin'}, {'v': 1})
        return 1
    return 0

# 获取最大购买次数
def getMaxBuyNum(uid):
    a = max(filter(lambda v:v[1]['vip']<=g.getGud(uid)['vip'], g.GC['storm']['base']['energy']['num2need'].items()),key=lambda x:int(x[0]))
    return int(a[0])

# 获取日志列表:
def getLogList(uid):
    _data = g.mdb.find('stormlog', {'$or': [{'uid':uid}, {'rival':uid}]}, limit=30, fields={'ttltime':0}, sort=[['ctime',-1]])
    # _data.sort(key=lambda x:x['ctime'], reverse=True)
    _temp = {
        "1": g.L('storm_seize_1'),
        "2": g.L('storm_seize_2'),
        "3": g.L('storm_seize_3'),
        "4": g.L('storm_seize_4'),
        "6": g.L('storm_seize_6'),
        "7": g.L('storm_seize_7'),
    }
    _color = {
        "1": g.L('storm_1'),
        "2": g.L('storm_2'),
        "3": g.L('storm_3'),
        "4": g.L('storm_4'),
        "5": g.L('storm_5'),
        "6": g.L('storm_6'),
        "7": g.L('storm_7'),
    }
    _delLog = []
    for i in _data:
        _delLog.append(i['_id'])
        del i['_id']

        i['headdata'] = g.m.userfun.getShowHead(i['uid'])
        # 和人对打
        if i['rival']:
            i['rival'] = g.m.userfun.getShowHead(i.pop('rival'))
            # uid是我， winside是我
            if uid == i['uid'] and i['winside'] == 0:
                i['desc'] = _temp['1'].format(i['rival']['name'], i['area'], _color[i['color']])
            # uid是我， winside是对手
            elif uid == i['uid'] and i['winside'] != 0:
                i['desc'] = _temp['6'].format(i['rival']['name'], i['area'], _color[i['color']])
            # uid是对手， winside是我
            elif i['winside'] != 0:
                i['desc'] = _temp['3'].format(i['headdata']['name'], i['area'], _color[i['color']])
            else:
                i['desc'] = _temp['7'].format(i['headdata']['name'], i['area'], _color[i['color']])
        # 打电脑
        else:
            # uid是我 winside 是我
            if i['winside'] == 0:
                i['desc'] = _temp['2'].format(i['area'], _color[i['color']])
            else:
                i['desc'] = _temp['4'].format(i['area'], _color[i['color']])

    # 如果刚好30条   就删除多余的
    if len(_delLog) == 30:
        g.mdb.delete('stormlog', {'uid':uid,'_id':{'$nin':_delLog}})

    return _data

# 获取随机五个要塞
def getRandFortress():
    _res = []
    _con = g.GC['storm']['base']
    _users = g.C.RANDLIST(getUsers(), len(_con['region'][str(_con['special'])])-1)
    _number = 1
    for i in _users:
        _res.append({
            'headdata':{'name': i['name'],'head':i['head']},
            'zhanli':i['maxzhanli'],
            'area':str(_con['special']),
            'number':_number
        })
        _number += 1
    return _res


# 获取玩家信息
def getUsers():
    _all = g.mc.get('storm_user')
    if not _all:
        _all = g.mdb.find('userinfo',sort=[['maxzhanli', -1]],fields=['_id','name','maxzhanli','head'],limit=30)
        g.mc.set('storm_user', _all)

    return _all

if __name__ == '__main__':
    print getLogList('8960_5c7e51c642c7ac0253d32477')