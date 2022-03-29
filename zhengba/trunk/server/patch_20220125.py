# !/usr/bin/python
# coding:utf-8
# 脚本模板

import sys

sys.path.append('./game')
import g

# 跳过模块内的where条件检测，若没有充分理由，请勿随意跳过
#g.m.pathDebug.SKIP_WHERE_CHECK = True

class Patch(object):

    @g.m.pathDebug.patch
    def syzc(self):
        _loglist = g.mdb.find('gamelog', {'type':"syzc_pass"})
        for log in _loglist:
            g.event.emit("stagefundExp", log["uid"], "syzc")

    @g.m.pathDebug.run
    def run(self):
        # run名字固定，在这里指定执行顺序
        self.syzc()


if __name__ == '__main__':
    patch = Patch()
    patch.run()