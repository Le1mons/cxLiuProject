#!/usr/bin/python
# coding:utf-8
'''
世界树--召唤
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [种族:str]
    :return:
    ::

        {'d':{
            'prize': [],
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    # 英雄的种族
    _zhongzu = str(data[0])

    _worldtreeCon = g.m.worldtreefun.getWorldTreeCon()
    _need = _worldtreeCon['callneed']
    # 检查世界树果实是否充足
    _chk = g.chkDelNeed(uid, _need)
    if not _chk['res']:
        if _chk['a'] == 'attr':
            _res['s'] = -100
            _res['attr'] = _chk['t']
        else:
            _res["s"] = -104
            _res[_chk['a']] = _chk['t']
        return _res

    _baodi = g.getAttrOne(uid, {'ctype': 'worldtree_baodi'}, keys='_id,v,num') or {'v': {}}

    _delData = g.delNeed(uid, _need,issend=0,logdata={'act': 'worldtree_call'})
    _prize = _worldtreeCon['prize']
    _dlzId = _worldtreeCon['calldlz'][_zhongzu]
    _dlPrize = g.m.diaoluofun.getGroupPrize(_dlzId)

    # 第n次没抽到50 就替换
    while _baodi.get('num',0) <= 200 and _baodi['v'].get(_zhongzu,0) + 1 == _worldtreeCon['baodi'][_zhongzu] and _dlPrize[0]['n'] < 50:
        _dlPrize = g.m.diaoluofun.getGroupPrize(_dlzId)

    _dlPrize += _prize
    _sendData = g.getPrizeRes(uid, _dlPrize, act={'act':'worldtree_call','prize':_dlPrize})
    _sendData['item'].update(_delData['item'])
    g.sendChangeInfo(conn, _sendData)

    # g.setAttr(uid,{'ctype':'worldtree_call'},{'$inc':{'v':1}})
    g.event.emit("WorldTree",uid)
    # 新年任务
    g.event.emit('newyear_task', uid, '3')
    # 节日狂欢
    g.event.emit('jierikuanghuan', uid, '11')
    # 王者招募任务监听
    g.event.emit("wzzmtask", uid, "111")
    g.event.emit("wzzmtask", uid, "113")

    # 趣味成就
    if g.GC['pre_hero'].get(_dlPrize[0]['t'],{}).get('star',0) >= 5:
        g.mdb.update('qwcj', {'uid': uid},{'data.13': 0}, upsert=True)
    else:
        g.mdb.update('qwcj', {'uid': uid}, {'$inc':{'data.13': 1}}, upsert=True)

    _num = 0 if _dlPrize[0]['n'] >= 50 else _baodi['v'].get(_zhongzu,0) + 1
    # 记录保底
    g.setAttr(uid,{'ctype':'worldtree_baodi'},{'$set':{'v.{}'.format(_zhongzu): _num},'$inc':{'num': 1}})

    _res['d'] = {'prize': _dlPrize}
    return _res


if __name__ == '__main__':
    uid = g.buid("xuzhao")
    g.debugConn.uid = uid
    print doproc(g.debugConn, data=['2'])