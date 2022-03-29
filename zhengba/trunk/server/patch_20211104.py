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
        _hdinfo = g.crossDB.find1("hdinfo", {"hdid": _hdid})
        if not _hdinfo:
            return

        _ctype2 = 'heropreheat_allnum'
        _conData = g.m.crosscomfun.getGameConfig({'ctype': _ctype2, 'k': _hdid})
        _allval = 0
        if _conData:
            _allval = _conData[0]["v"]

        if _allval < 100000:
            g.m.crosscomfun.setGameConfig({'ctype': _ctype2, 'k': _hdid}, {"v": 100212})

    @g.m.pathDebug.run
    def run(self):
        # run名字固定，在这里指定执行顺序
        self.huodong()




if __name__ == '__main__':
    patch = Patch()
    patch.run()