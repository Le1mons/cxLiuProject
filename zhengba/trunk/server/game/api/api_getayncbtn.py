#!/usr/bin/python
#coding:utf-8
'''
获取客户端动态按钮
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g
import huodong
def proc(conn,data):
    """

    :param conn:
    :param data: [1 全部都要 or [需要的类型]]
    :return:
    ::

        {"d":{
            'shouchong': 首充是否开启,
            'kaifukuanghuan': 开服狂欢 {'act': 是否开启, 'kfkhetime':结束时间},
            'onlineprize': 在线奖励是否领取完毕,
            'xianshilibao': 限时礼包[{'rtime':结束时间,'buynum':购买次数,'name':礼包名字,其余数据参见chongzhihd.json里的yangchenglibao和dengjilibao具体星级等级对应的}],
            'herocoming': 英雄降临,
            'meirishouchong': 每日首充 [{'v':已充值金额, 'receive':是否领取}],
            'ciridenglu': 次日登陆送礼 {'time': 结束时间, 'can':[可以领取的id], 'gotarr':[已经领取得]},
            'lvfund': 等级基金 是否全部领取完毕,
            'kingstatue': 王者雕像 雕像名字 or '',
            'kaifulibao': 开服礼包 {'day':天数, {’天数‘:{’充值id‘:充值次数}}},
            'crosswz': 王者荣耀倒计时 -1 或者时间戳
        }
        's': 1}

    """
    _res = doproc(conn,data)
    conn.response(_res)
    conn.send()

# 发送未领取的奖励
def sendEmail(uid, info):
    _prize = []
    for i in range(1, info['lv'] + 1):
        # 普通奖励
        if i not in info['receive']['base']:
            _prize += info['prize'][str(i)]['base']

        # 进阶奖励
        if info['jinjie'] and i not in info['receive']['jinjie']:
            _prize += info['prize'][str(i)]['jinjie']

    _prize = g.fmtPrizeList(_prize)
    if _prize:
        g.m.emailfun.sendEmails([uid], 1, g.GC['flag']['base']['email']['title'], g.GC['flag']['base']['email']['content'],_prize)

@g.apiCheckLogin
def doproc(conn,data):
    _res = {"s":1}
    uid = conn.uid
    
    if len(data)==0:
        _type = 1
    else:
        _type = data[0]
        
    _func = {
        # 首充
        'shouchong':g.m.shouchongfun.isOpen,
        # 开服狂欢 ok
        "kaifukuanghuan":g.m.kfkhfun.getKfkh,
        # 在线奖励
        "onlineprize":g.m.onlineprizefun.getOnlineOver,
        # 限时礼包
        'xianshilibao':g.m.libaofun.getLibaoData,
        # 英雄降临
        'herocoming': getHerocoming,
        # 每日首充
        'meirishouchong': getMeirishouchong,
        # 判断月基金活动是否开启
        # 'yuejijin':huodong.monthfund.getMonthFundInfo,
        # 次日登陆送礼
        'ciridenglu':g.m.signdenglufun.getCRDLisOpen,
        # 等级基金
        'lvfund':g.m.huodong.dengjijijin.chkLvFundOver,
        # 王者雕像
        'kingstatue': getKingstatue,
        # 开服礼包
        'kaifulibao':g.m.libaofun.getKaiFuLibao,
        # 王者荣耀倒计时
        'crosswz': g.m.crosswzfun.getDldEndTime,
        # 节日狂欢
        'jrkh': getJRKH,
        # 王者归来
        'kingsreturn': getKingReturn,
        # 变样术特权
        'guinsoo': getGuinsoo,
        # 五军之战
        'wjzz': g.m.wjzzfun.chkWjzzData,
        # 英雄任务
        'herotask':getHeroTask,
        # 王者招募
        "wangzhezhaomu": g.m.wangzhezhaomufun.isOpen,
        # 遗迹考古
        'yjkg': g.m.yjkgfun.getYjkgStatus,
        # 每日特惠
        'todaylibao': g.m.todaylibaofun.isOpen,
        # 寻龙定穴
        "xldx": chkXLDX,
        # 迷宫重置
        "maze": g.m.mazefun.getMazeCD,
        # 迷宫重置
        "anniversary": g.m.anniversaryfun.checkOpen,
        # 中秋
        "midautumn": g.m.midautumnfun.checkOpen,
        # 神殿基金
        "sdjj": g.m.sdjjfun.checkOpen,
        # 双11
        "double11": g.m.double11fun.checkOpen,
        # 公平竞技场
        "gpjjc": g.m.gongpingjjcfun.isOpen,
        # 专属礼包
        "zslb": g.m.zhuanshulibao_68.isOpen,
        # 新年活动 - 英雄人气冲榜
        "herohot": g.m.herohot_69.isOpen,
        # # 元宵活动 - 谜语人
        # "riddles": g.m.riddles_70.isOpen,
        # # 植树节活动
        # "planttrees": g.m.planttreesfun.checkOpen,
        # 欢乐扭蛋
        "niudan": g.m.niudanfun.checkOpen,
        # 五一活动
        "labour": g.m.labourfun.checkOpen,
        # # 龙舟活动
        # "longzhou": g.m.longzhoufun.checkOpen,
        # # 夏日庆典
        # "xiariqingdian": g.m.xiariqingdianfun.checkOpen,
        # # 七夕活动
        # "qixi": g.m.qixifun.checkOpen,
        # # 周年预热
        # "zhounian_login": g.m.denglulingjiang15.chkOpen,
        # # 三周年活动
        # "zhounian3": g.m.zhounian3fun.checkOpen,
        # 金秋活动
        "midautumn2": g.m.midautumn2fun.checkOpen,
        # 英雄主题
        "herotheme": g.m.herothemefun.checkOpen,
        # 英雄预热
        "heropreheat": g.m.heropreheat_79.checkOpen,
        # # 圣诞活动
        # "christmas": g.m.christmasfun.checkOpen,
        # 新年活动3
        "newyear3": g.m.newyear3fun.checkOpen,
        # 元宵活动3
        "yuanxiao3": g.m.yuanxiao3fun.checkOpen,
        # 新年祝贺活动
        "newyearwish": g.m.newyearwish_84.checkOpen,
        # 新年红包活动
        "newyearhongbao":g.m.newyearhongbao_85.checkOpen
    }
    _resData = {}
    # 如果是1  就全部都要
    if _type != 1:
        for key in _type:
            # if key == 'herocoming':
            #     # 英雄降临
            #     _hdData = g.m.huodongfun.getHDDATAbyHtype(uid, 18)
            #     _resData['herocoming'] = _hdData['val'] if _hdData else []
            # elif key == 'meirishouchong':
            #     _resData['meirishouchong'] = g.getAttrByDate(uid, {'ctype': 'meirishouchong'}, keys='_id,v,receive')
            # # elif key == 'xianshi_zhaomu':
            # #     _resData[key] = g.m.xszmfun.isOpen()
            # else:
            _resData[key] = _func[key](uid)
    else:
        g.event.emit('GIFT_PACKAGE', uid, 'tianshulibao', g.getOpenDay(), send=0)

        for _, _function in _func.items():
            _resData[_] = _function(uid)

        # 第一次进游戏会拉所有的  故在此判断登陆次数   增加登陆次数
        # _cacheKey = "_signdenglufun_from_getayncbtn_"+ str(uid)
        # if g.mc.get(_cacheKey) != g.C.DATE():
        #     g.mc.set(_cacheKey,g.C.DATE(),300)
        #     g.m.signdenglufun.getLoginNum(uid)
        # 判断好友数量
        g.m.friendfun.chkFriendNum(uid)

        # 战旗
        _flag = g.mdb.find1('flag', {'uid': uid},fields=['_id','lv','endtime','prize','exp','receive','addtime','jinjie'])
        # 没有就根据建号时间 或者 功能上新生成
        # 重新轮回一次
        if _flag and  g.C.NOW() >= _flag['endtime']:
            # 发送未领取的奖励
            sendEmail(uid, _flag)
            g.m.flagfun.updateFlagData(uid, g.C.ZERO(g.C.NOW()), 1)

        # 上传自己的登录时间
        g.m.friendfun.uploadLoginTime(uid)

        # 新年任务
        g.event.emit('newyear_task', uid, '1')
        # 生日派对
        g.event.emit('birthday_party', uid)
        # 每次重进游戏时 删掉公会争锋红点相关、
        # g.mdb.delete('playattr',{'uid':uid,'ctype':'ghcompeting_openonce'})

        #//正常外网运营的区，极低可能性没有活动，如果都没有活动了，玩家打开一个空界面也没啥影响，客户端常态显示 限时活动 的按钮
        # 限时活动
        #_resData['xianshihuodong'] = g.m.huodongfun.getOpenList(isid=1)
        # _resData['yuejijin'] = _func['yuejijin'](uid)
        # _resData['chaojijijin'] = _func['chaojijijin'](uid)
        # _resData['xianshi_zhaomu'] = g.m.xszmfun.isOpen()

    _res['d'] = _resData

    # 噬渊战场提醒邮件
    if g.chkOpenCond(uid, 'yjxw'):
        _data = g.getAttrOne(uid, {"ctype": "syzc_sendemail"})
        if not _data:
            _title = "贺双旦，新挑战"
            _content = "尊敬的勇士：适逢双旦来临，新的挑战[噬渊战场]已经开启，为了您能在战场上勇往直前，我们为你准备了一份战前物资，请在噬渊战场道具栏查收，道具及其珍贵，请合理使用。"
            _prize = [{"a": "item", "t": "1201", "n": 1}, {"a": "item", "t": "1202", "n": 3},
                      {"a": "item", "t": "1203", "n": 3}, {"a": "item", "t": "1204", "n": 3},
                      {"a": "item", "t": "1205", "n": 1}, {"a": "item", "t": "1206", "n": 2},
                      {"a": "item", "t": "1207", "n": 4}]
            g.m.emailfun.sendEmails([uid], 1, _title, _content, prize=_prize)
            g.setAttr(uid, {"ctype": "syzc_sendemail"}, {"v":1})



    return _res

def getKingReturn(uid):
    _res = g.m.userfun.chkKingdReturn(uid)
    return _res['res']

def getHerocoming(uid):
    _hdData = g.m.huodongfun.getHDDATAbyHtype(uid, 18)
    return _hdData['val'] if _hdData else []


def getMeirishouchong(uid):
    if not g.m.shouchongfun.chkOpen(uid):
        return []
    return g.getAttrByDate(uid, {'ctype': 'meirishouchong'}, keys='_id,v,receive') or [{'v': 0}]

def getKingstatue(uid):
    _statue = g.m.crosswzfun.getKingStatueInfo()
    return _statue['name'] if _statue.get('uid') else ''

def getJRKH(uid):
    hdinfo = g.m.jierikuanghuan_44.getHDinfoByHtype(44)
    return hdinfo['hdid'] if hdinfo and 'hdid' in hdinfo else 0

def getGuinsoo(uid):
    _time = g.getAttrByCtype(uid, 'guinsoo_expire', bydate=False)
    _num = 0
    if _time > g.C.NOW():
        _num = 3 - g.getPlayAttrDataNum(uid, 'cross_guinsoo')
    return {'time': _time, 'num': _num}

def getHeroTask(uid):
    # 14星的人任务
    return g.getAttrByCtype(uid, 'hero_starupgrade', bydate=False, default={})

# 检测是否开启
def chkXLDX(uid):
    _res = {'act': 0}
    _data = g.m.huodongfun.getHDinfoByHtype(49)
    if _data and 'hdid' in _data:
        _res['act'] = 1
        _res['rtime'] = _data['rtime']
        _res['hdid'] = _data['hdid']
        _res['prize'] = _data['data']['taskprize']
    return _res

# 资源回归
def ZYHG(uid):
    _hd = g.m.huodongfun.getHDinfoByHtype(62)
    res = {}
    # 活动开了  并且 离线24小时
    if _hd and 'hdid' in _hd:
        data = g.mdb.find1('hddata', {'uid': uid, 'hdid': _hd['hdid']}, fields=['_id', 'val', 'gotarr'])
        if not data and (g.C.NOW()-g.getGud(uid)['lastlogintime'])//3600 >= 24:
            g.mdb.insert('hddata',{'uid':uid,'hdid':_hd['hdid'],'val':g.C.NOW()-g.getGud(uid)['lastlogintime'],'gotarr':{}})
            res = {'val': g.C.NOW()-g.getGud(uid)['lastlogintime'], 'gotarr': {}}
        elif data:
            res = data
    return res

if __name__ == "__main__":
    uid = g.buid('ysr1')
    g.debugConn.uid = uid
    g.chkOpenCond(uid, 'yjxw')
    print doproc(g.debugConn,[["newyearhongbao"]])