# coding:utf-8
'''
owner:@shadowsmilezhou
email:630551760@qq.com
data: 2018/7/6/16:14

d {'rtime':12313,'items':[{'num':3}, ...]}

'''

import sys

sys.path.append('..')

import g

def proc(conn, data):
    """

    :param conn:
    :param data: [类型:str('week','month')]
    :return:
    ::

        {'d':{
            'itemdict': {’充值id‘: {'num': 次数}},
            'et': 结束时间
        }
        's': 1}

    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    uid = conn.uid
    _res = {"s": 1}
    key = str(data[0])

    res = g.m.weekmonthlibaofun.getWMLiBao(uid,key)
    # 周期结束
    nt = g.C.NOW()
    if nt > res['et']:
        res = g.m.weekmonthlibaofun.initData(uid,key)


    if key == 'month':
        _con = g.GC['weekmonthlibao']['month']['5']['itemdict']
        for _,item in res['itemdict'].items():
            if _con[_]['rmbmoney'] == 0:
                continue
            item['num'] += g.m.vipfun.getTeQuanNumByAct(uid,'MAXVIPBUYNUM')
    res['key'] = g.m.weekmonthlibaofun.getWeekNum(key)
    _res["d"] = res
    return _res

if __name__ == "__main__":
    uid = g.buid('xuzhao')
    g.debugConn.uid = uid
    print proc(g.debugConn, ['day'])
