#!/usr/bin/python
# coding:utf-8

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g
from ZBFight import ZBFight
'''
试炼之塔 - 下一关
'''
def proc(conn, data,key=None):
    """


      :param conn:
      :param data:
      :param key:
      :return:
      ::

          {'d': {
               u'ctime': 1585320945,
               u'eventdata': {u'1': {},
                              u'10': {u'11': 0},
                              u'11': {},
                              u'3': {},
                              u'8': {u'7': 1}},
               u'eventgrid': {u'1': u'8',
                              u'10': u'8',
                              u'11': u'10',
                              u'12': u'11',
                              u'14': u'3',
                              u'18': u'1',
                              u'6': u'11',
                              u'7': u'8'},
               u'extbuff': {},
               u'finishgrid': [u'11', u'7'],
               u'herodata': [[{u'atk': 1011,
                               u'atkpro': 1000,
                               u'baojipro': 0,
                               u'baoshangpro': 0,
                               u'bd1skill': [u'41023111'],
                               u'bd2skill': [],
                               u'bd3skill': [],
                               u'commonbuff': {u'chenghao': {}},
                               u'curepro': 0,
                               u'def': 1477,
                               u'defpro': 1000,
                               u'dpspro': 0,
                               u'enlargepro': 1.5,
                               u'gedangpro': 0,
                               u'hid': u'41023',
                               u'hp': 13508,
                               u'hppro': 1000,
                               u'jianshangpro': 0,
                               u'jingzhunpro': 0,
                               u'job': 1,
                               u'lv': 250,
                               u'maxhp': 13728,
                               u'maxnuqi': 100,
                               u'miankongpro': 0,
                               u'normalskill': u'41023002',
                               u'nuqi': 60,
                               u'pojiapro': 0,
                               u'pos': 1,
                               u'pvpdpspro': 0,
                               u'pvpundpspro': 0,
                               u'shenqidpspro': 0,
                               u'side': 0,
                               u'skill': [],
                               u'skilldpspro': 0,
                               u'speed': 662,
                               u'speedpro': 1000,
                               u'star': 0,
                               u'unbaojipro': 0,
                               u'undercurepro': 0,
                               u'undotdpspro': 0,
                               u'undpspro': 0,
                               u'unliuxuepro': 0,
                               u'unzhongdupro': 0,
                               u'unzhuoshaopro': 0,
                               u'xpskill': u'41023012',
                               u'zhongdudpsdrop': 0,
                               u'zhongdudpspro': 0,
                               u'zhongzu': 4}]],
               u'lasttime': 1585331165,
               u'layer': 2,
               u'layernum': 0,
               u'mibaonum': 1,
               u'npcdata': [{u'headdata': {u'head': u'41066',
                                           u'lv': 1,
                                           u'name': u'\u5f20\u98de'},
                             u'herolist': [{u'atk': 179,
                                            u'atkpro': 1000,
                                            u'baojipro': 0,
                                            u'baoshangpro': 0,
                                            u'bd1skill': [u'41066114',
                                                          u'41066124'],
                                            u'bd2skill': [u'41066211',
                                                          u'41066221'],
                                            u'bd3skill': [u'41066314'],
                                            u'curepro': 0,
                                            u'def': 64,
                                            u'defpro': 1000,
                                            u'dpspro': 0,
                                            u'enlargepro': 1,
                                            u'gedangpro': 0,
                                            u'head': u'41066',
                                            u'hid': u'41066',
                                            u'hp': -19,
                                            u'hppro': 1000,
                                            u'jianshangpro': 0,
                                            u'jingzhunpro': 0,
                                            u'job': 1,
                                            u'lv': 1,
                                            u'maxhp': 1896,
                                            u'maxnuqi': 100,
                                            u'miankongpro': 0,
                                            u'normalskill': u'41066002',
                                            u'nuqi': 10,
                                            u'pojiapro': 0,
                                            u'pos': 1,
                                            u'pvpdpspro': 0,
                                            u'pvpundpspro': 0,
                                            u'shenqidpspro': 0,
                                            u'side': 1,
                                            u'skill': [],
                                            u'skilldpspro': 0,
                                            u'speed': 225,
                                            u'speedpro': 1000,
                                            u'star': 0,
                                            u'unbaojipro': 0,
                                            u'undercurepro': 0,
                                            u'undotdpspro': 0,
                                            u'undpspro': 0,
                                            u'unliuxuepro': 0,
                                            u'unzhongdupro': 0,
                                            u'unzhuoshaopro': 0,
                                            u'xpskill': u'41066012',
                                            u'zhanli': 475,
                                            u'zhongdudpsdrop': 0,
                                            u'zhongdudpspro': 0,
                                            u'zhongzu': 4}],
                             u'zhanli': 475},
                            {u'headdata': {u'head': u'41066',
                                           u'lv': 1,
                                           u'name': u'\u5f20\u98de'},
                             u'herolist': [{u'atk': 179,
                                            u'atkpro': 1000,
                                            u'baojipro': 0,
                                            u'baoshangpro': 0,
                                            u'bd1skill': [u'41066114',
                                                          u'41066124'],
                                            u'bd2skill': [u'41066211',
                                                          u'41066221'],
                                            u'bd3skill': [u'41066314'],
                                            u'curepro': 0,
                                            u'def': 64,
                                            u'defpro': 1000,
                                            u'dpspro': 0,
                                            u'enlargepro': 1,
                                            u'gedangpro': 0,
                                            u'head': u'41066',
                                            u'hid': u'41066',
                                            u'hp': -33,
                                            u'hppro': 1000,
                                            u'jianshangpro': 0,
                                            u'jingzhunpro': 0,
                                            u'job': 1,
                                            u'lv': 1,
                                            u'maxhp': 1896,
                                            u'maxnuqi': 100,
                                            u'miankongpro': 0,
                                            u'normalskill': u'41066002',
                                            u'nuqi': 10,
                                            u'pojiapro': 0,
                                            u'pos': 1,
                                            u'pvpdpspro': 0,
                                            u'pvpundpspro': 0,
                                            u'shenqidpspro': 0,
                                            u'side': 1,
                                            u'skill': [],
                                            u'skilldpspro': 0,
                                            u'speed': 225,
                                            u'speedpro': 1000,
                                            u'star': 0,
                                            u'unbaojipro': 0,
                                            u'undercurepro': 0,
                                            u'undotdpspro': 0,
                                            u'undpspro': 0,
                                            u'unliuxuepro': 0,
                                            u'unzhongdupro': 0,
                                            u'unzhuoshaopro': 0,
                                            u'xpskill': u'41066012',
                                            u'zhanli': 475,
                                            u'zhongdudpsdrop': 0,
                                            u'zhongdudpspro': 0,
                                            u'zhongzu': 4}],
                             u'zhanli': 475},
                            {u'headdata': {u'head': u'41066',
                                           u'lv': 1,
                                           u'name': u'\u5f20\u98de'},
                             u'herolist': [{u'atk': 179,
                                            u'atkpro': 1000,
                                            u'baojipro': 0,
                                            u'baoshangpro': 0,
                                            u'bd1skill': [u'41066114',
                                                          u'41066124'],
                                            u'bd2skill': [u'41066211',
                                                          u'41066221'],
                                            u'bd3skill': [u'41066314'],
                                            u'curepro': 0,
                                            u'def': 64,
                                            u'defpro': 1000,
                                            u'dpspro': 0,
                                            u'enlargepro': 1,
                                            u'gedangpro': 0,
                                            u'head': u'41066',
                                            u'hid': u'41066',
                                            u'hp': -46,
                                            u'hppro': 1000,
                                            u'jianshangpro': 0,
                                            u'jingzhunpro': 0,
                                            u'job': 1,
                                            u'lv': 1,
                                            u'maxhp': 1896,
                                            u'maxnuqi': 100,
                                            u'miankongpro': 0,
                                            u'normalskill': u'41066002',
                                            u'nuqi': 10,
                                            u'pojiapro': 0,
                                            u'pos': 1,
                                            u'pvpdpspro': 0,
                                            u'pvpundpspro': 0,
                                            u'shenqidpspro': 0,
                                            u'side': 1,
                                            u'skill': [],
                                            u'skilldpspro': 0,
                                            u'speed': 225,
                                            u'speedpro': 1000,
                                            u'star': 0,
                                            u'unbaojipro': 0,
                                            u'undercurepro': 0,
                                            u'undotdpspro': 0,
                                            u'undpspro': 0,
                                            u'unliuxuepro': 0,
                                            u'unzhongdupro': 0,
                                            u'unzhuoshaopro': 0,
                                            u'xpskill': u'41066012',
                                            u'zhanli': 475,
                                            u'zhongdudpsdrop': 0,
                                            u'zhongdudpspro': 0,
                                            u'zhongzu': 4}],
                             u'zhanli': 475},
                            {u'headdata': {u'head': u'41066',
                                           u'lv': 1,
                                           u'name': u'\u5f20\u98de'},
                             u'herolist': [{u'atk': 179,
                                            u'atkpro': 1000,
                                            u'baojipro': 0,
                                            u'baoshangpro': 0,
                                            u'bd1skill': [u'41066114',
                                                          u'41066124'],
                                            u'bd2skill': [u'41066211',
                                                          u'41066221'],
                                            u'bd3skill': [u'41066314'],
                                            u'curepro': 0,
                                            u'def': 64,
                                            u'defpro': 1000,
                                            u'dpspro': 0,
                                            u'enlargepro': 1,
                                            u'gedangpro': 0,
                                            u'head': u'41066',
                                            u'hid': u'41066',
                                            u'hp': -60,
                                            u'hppro': 1000,
                                            u'jianshangpro': 0,
                                            u'jingzhunpro': 0,
                                            u'job': 1,
                                            u'lv': 1,
                                            u'maxhp': 1896,
                                            u'maxnuqi': 100,
                                            u'miankongpro': 0,
                                            u'normalskill': u'41066002',
                                            u'nuqi': 10,
                                            u'pojiapro': 0,
                                            u'pos': 1,
                                            u'pvpdpspro': 0,
                                            u'pvpundpspro': 0,
                                            u'shenqidpspro': 0,
                                            u'side': 1,
                                            u'skill': [],
                                            u'skilldpspro': 0,
                                            u'speed': 225,
                                            u'speedpro': 1000,
                                            u'star': 0,
                                            u'unbaojipro': 0,
                                            u'undercurepro': 0,
                                            u'undotdpspro': 0,
                                            u'undpspro': 0,
                                            u'unliuxuepro': 0,
                                            u'unzhongdupro': 0,
                                            u'unzhuoshaopro': 0,
                                            u'xpskill': u'41066012',
                                            u'zhanli': 475,
                                            u'zhongdudpsdrop': 0,
                                            u'zhongdudpspro': 0,
                                            u'zhongzu': 4}],
                             u'zhanli': 475}],
                   u'opengrid': [u'16',
                                 u'17',
                                 u'18',
                                 u'19',
                                 u'20',
                                 u'11',
                                 u'12',
                                 u'13',
                                 u'14',
                                 u'15',
                                 u'6',
                                 u'7',
                                 u'8',
                                 u'9',
                                 u'10',
                                 u'1',
                                 u'2',
                                 u'3',
                                 u'4',
                                 u'5'],
                   u'refreshtime': 1585411200,
                   u'toplayer': 2,
                   u'uid': u'0_5dbbe9f40ae9fe0900d72d6d',
                   u'winnum': 9,
                   u'yaoshi': 0,
                   u'zhanli': 3861},
     's': 1}

    """

    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

def _checkCond(uid,data):
    _chkData = {}
    _chkData["s"] = 1


    # 判断是否开启
    if not g.chkOpenCond(uid, 'shilianzt'):
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('global_noopen')
        return _chkData
    _data = g.m.shilianztfun.getData(uid)

    _con = dict(g.GC["shilianztcom"])
    _layerNum = _data["layernum"]

    _nt = g.C.NOW()

    if _layerNum >= _con["daynum"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('shilianzt_res_-1')
        return _chkData

    # 判断是否通关
    if not _data["killboss"]:
        _chkData['s'] = -1
        _chkData['errmsg'] = g.L('shilianzt_res_-2')
        return _chkData


    _chkData["data"] = _data
    _chkData["layernum"] = _layerNum
    return _chkData


@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _resData = {}
    # 检测
    _chkData = _checkCond(uid, data)
    if _chkData["s"] != 1:
        return _chkData

    _data = _chkData["data"]
    _layerNum = _chkData["layernum"]
    _setData = {}
    # 随机生成下一层的数据
    # 插入数据
    _data["layer"] += 1
    _setData["layer"] = _data["layer"]
    # 镜灵
    _setData["mirror"] = _data["mirror"] = {}
    # 是否击败boss
    _setData["killboss"] = _data["killboss"] = 0
    # 是否击败镜灵
    _setData["killmirror"] =_data["killmirror"] = 0
    # 本层已经生成的事件
    _setData["eventdata"] = _data["eventdata"] = g.m.shilianztfun.generateEvent(_setData)
    # 已经完成的event
    _setData["finishevent"] = _data["finishevent"] = []
    # 使用过的英雄
    _setData["usehero"] = _data["usehero"] = []
    # 打boss使用的英雄
    _setData["bossfightinfo"] = _data["bossfightinfo"] = []
    # 层数+1
    _setData['layernum'] = _data['layernum'] + 1
    _data['layernum'] = _setData['layernum']

    if _data["layer"] > _data.get("toplayer", 0):
        # 获取最大层数
        _setData["toplayer"] = _data["toplayer"] = _data["layer"]

    g.m.shilianztfun.setData(uid, _setData)

    # g.m.shilianztfun.setLayerNum(uid, _layerNum + 1)
    _resData["mydata"] = _data
    _res["d"] = _resData

    return _res


if __name__ == '__main__':
    from pprint import pprint

    uid = g.buid('1')
    g.debugConn.uid = uid
    _data = [0,0]
    _r = doproc(g.debugConn, _data)
    pprint(_r)
    print 'ok'