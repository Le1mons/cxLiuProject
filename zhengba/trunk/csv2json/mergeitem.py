#!/usr/bin/python
#coding:utf-8

import json,glob,os

'''
合并所有item为一个json
'''

_commoent = {    
    u"comment": {
        "color": u"物品品质(颜色)", 
        u"以上为必选key,所有道具都会有的东西": u"可选key的注释请写在下面", 
        "name": u"道具名", 
        "k": u"道具id(itemid)", 
        "isMutil": u"是否可叠加",
        "intr":u"上面的描述",
        "intr2":u"下面的描述",
        "uselv":u"使用等级限制",
        "ispm":u"是否可拍卖",
        "type": u"道具类型(大类型,主要用于分类,1 是道具 2 是消耗品", 
        "stype": u"子类型,道具实际类型(4 可出售道具 5 可合成道具 6 不可使用类型 8.礼盒类型 9 小兵碎片 10 使用需要消耗类型)",
        "salemoney":u"可出售类型的出售单价,货币为金币(jinbi)",
        "hcnum":u"合成所需数量",
        "hcprize":u"合成获得奖励"
    },
}
def start():
    print "start merge all item"
    files = glob.glob('samejson/item*.json')
    _globalMap = {}
    for ele in files:
        print "process json:%s" % ele
        _raw = open(ele,"rb").read()
        _rr = json.loads(_raw,encoding='utf-8')
        _globalMap.update(_rr)
    
    #_globalMap.update(_commoent)
    _output = json.dumps(_globalMap,indent=4,ensure_ascii=False).encode('utf-8')
    _comments = json.dumps(_commoent,indent=4,ensure_ascii=False).encode('utf-8')
    _file = open("item.json","w")
    _file.truncate()
    _file.write(_comments[0:len(_comments)-2] + ",")
    _file.write(_output[1:])
    _file.close()
    print "process success..."
    
start()


