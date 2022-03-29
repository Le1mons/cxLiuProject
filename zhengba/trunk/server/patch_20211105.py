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
    def huodong2(self):
        _hdid = 1636004780
        _hdinfo = g.mdb.find1("hdinfo", {"hdid": _hdid})
        if not _hdinfo:
            return

        _hddatas = g.mdb.find("hddata", {"hdid": _hdid})
        for hd in _hddatas:
            _heros = g.mdb.find("hero", {"hid": {"$in": ["14065", "14066"]}, "uid":hd["uid"]})
            if not _heros:
                continue
            if hd["val"] != 0:
                continue
            _setData = {}
            _maxStar = max([hero["star"] for hero in _heros])

            _setData["val"] = _maxStar
            if hd["jifen"] > 2000:
                _con = g.m.herothemefun.getCon()
                _herostarpro = _con["herostarpro"]
                if str(_maxStar) in _herostarpro:
                    _jifenPro = _herostarpro[str(_maxStar)]["jifen"]
                    _addJifen = (hd["jifen"] - 2000) * _jifenPro / 1000
                    hd["jifen"] += _addJifen
                    _setData["jifen"] = hd['jifen']
                print "hduid",hd["uid"]
            g.m.huodongfun.setMyHuodongData(hd["uid"], int(_hdinfo["hdid"]), _setData)


    @g.m.pathDebug.run
    def run(self):
        # run名字固定，在这里指定执行顺序
        self.huodong2()




if __name__ == '__main__':
    patch = Patch()
    patch.run()