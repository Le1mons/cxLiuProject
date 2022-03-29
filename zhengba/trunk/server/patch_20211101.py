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
    def huodong(self):
        _hdid = 1635418777
        _hdinfo = g.mdb.find1("hdinfo", {"hdid": _hdid})
        if not _hdinfo:
            return

        _hddatas = g.mdb.find("hddata", {"hdid":_hdinfo["hdid"]})
        for hd in _hddatas:
            a = 0
            if "4" not in hd["task"]["rec"]:
                _num = g.mdb.count("gamelog", {"uid":hd["uid"], "type": "fasttxprize", "data.prize":{"$exists": 1}, "ctime":{"$gte":1635696000}})
                hd["task"]["data"]["4"] = _num
                a = 1
            if "2" not in hd["task"]["rec"]:
                _data = g.mdb.find1("task", {"uid":hd["uid"], "taskid":"1", "isreceive":1})
                if _data:
                    hd["task"]["data"]["1"] = 1
                    a = 1
            if a:
                g.m.huodongfun.setMyHuodongData(hd["uid"], int(_hdinfo["hdid"]), {"task":hd["task"]})


    def hero(self):
        _heros = g.mdb.find("hero", {"hid":{"$in":["14055", "14056"]}})
        for hero in _heros:
            _bdskill1 = hero["bd1skill"]
            _bdskill2 = hero["bd2skill"]
            _bdskill3 = hero["bd3skill"]
            _chk1 = 0
            _chk2 = 0
            _chk3 = 0
            _setData = {}
            for idx, skillid in enumerate(_bdskill1):
                if isinstance(skillid, int):
                    _bdskill1[idx] = str(skillid)
                    _chk1 = 1
            if _chk1:
                _setData["bd1skill"] = _bdskill1

            for idx, skillid in enumerate(_bdskill2):
                if isinstance(skillid, int):
                    _bdskill2[idx] = str(skillid)
                    _chk2 = 1
            if _chk2:
                _setData["bd2skill"] = _bdskill2

            for idx, skillid in enumerate(_bdskill3):
                if isinstance(skillid, int):
                    _bdskill3[idx] = str(skillid)
                    _chk3 = 1
            if _chk3:
                _setData["bd3skill"] = _bdskill3
            if _setData:
                g.mdb.update("hero", {"_id":hero["_id"]}, _setData)

    @g.m.pathDebug.run
    def run(self):
        # run名字固定，在这里指定执行顺序
        self.huodong()
        self.hero()



if __name__ == '__main__':
    patch = Patch()
    patch.run()