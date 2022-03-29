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

        _hddatas = g.mdb.find("hddata", {"hdid": _hdid})
        for hd in _hddatas:
            _openData = g.m.heropreheat_79.getOpenData(hd["uid"], _hdinfo)
            hdata = _openData["myinfo"]
            if hdata["dianzan"]:
                continue
            hdata["task"]["data"]["3"] = 1
            g.m.huodongfun.setMyHuodongData(hd["uid"], int(_hdinfo["hdid"]), {"task": hdata["task"], "dianzan":1})

    @g.m.pathDebug.run
    def run(self):
        # run名字固定，在这里指定执行顺序
        self.huodong()




if __name__ == '__main__':
    patch = Patch()
    patch.run()