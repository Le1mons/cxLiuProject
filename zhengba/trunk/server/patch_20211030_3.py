# !/usr/bin/python
# coding:utf-8
# 脚本模板

import sys

sys.path.append('./game')
import g

# 跳过模块内的where条件检测，若没有充分理由，请勿随意跳过
g.m.pathDebug.SKIP_WHERE_CHECK = True

class Patch(object):

    @g.m.pathDebug.patch
    def huodong1(self):
        _dkey = g.m.gonghuisiegefun.getWeekKey()
        _con = g.GC["gonghuisiege"]
        _cityInfo = _con["cityinfo"]
        # 获取当前最大的分组
        _maxGroupId = 0
        _maxServerGroup = g.crossDB.find("servergroup", {"dkey": _dkey}, fields=['_id', 'gid'])
        if _maxServerGroup:
            _maxGroupId = int(max(_maxServerGroup, key=lambda x: int(x['gid']))['gid'])
            # 分发不同组的奖励
            for _groupid in xrange(_maxGroupId + 1):
                _groupid = str(_groupid)
                for cityid, info in _cityInfo.items():
                    if not info["isopen"]:
                        continue
                    _rankList = g.crossDB.find("gonghui_siege_rank",
                                               {"dkey": _dkey, "cityid": cityid, "groupid": _groupid,
                                                "jifen": {"$gt": 0}},
                                               fields=["_id", "jifen", "ghid", "sid"], limit=3, sort=[["jifen", -1]])
                    for i in _rankList:
                        _ghid = i["ghid"]

                        _data = g.crossDB.find1("gonghui_siege", {"dkey": _dkey, "groupid": _groupid, "ghid":_ghid},fields=["_id", "sid"], sort=[["jifen", -1]])
                        if not _data:
                            print _ghid
                            continue

                        _sid = _data["sid"]
                        emails = g.crossDB.find("crossemail", {"ghid": _ghid, "title":"阿拉希战场奖励"})
                        for email in emails:
                            if email["sid"] != str(_sid):
                                g.crossDB.update("crossemail", {"_id":email["_id"]}, {"sid": str(_sid), "ifpull": 0})
                    # 幸运奖励
                    _luckyInfo = g.crossDB.find1("gonghui_siege_rank",
                                   {"dkey": _dkey, "cityid": cityid, "groupid": _groupid, "lucky": 1},
                                   fields=["_id", "jifen", "ghid", "sid"])

                    if _luckyInfo:
                        _ghid = _luckyInfo["ghid"]
                        _luckyData = g.crossDB.find1("gonghui_siege", {"dkey": _dkey, "groupid": _groupid, "ghid": _ghid},
                                                fields=["_id", "sid"], sort=[["jifen", -1]])
                        _sid = _luckyData["sid"]
                        emails = g.crossDB.find("crossemail", {"ghid": _ghid, "title": "阿拉希战场奖励"})
                        for email in emails:
                            if email["sid"] != str(_sid):
                                g.crossDB.update("crossemail", {"_id": email["_id"]}, {"sid": str(_sid), "ifpull": 0})

    @g.m.pathDebug.run
    def run(self):
        # run名字固定，在这里指定执行顺序
        self.huodong1()



if __name__ == '__main__':
    patch = Patch()
    patch.run()