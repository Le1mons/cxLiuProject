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
    def svr(self):
        _name = g.m.crosscomfun.getSNameBySid(g.getSvrIndex())
        g.crossDB.update('ladder',{'key':'2020-46','sid':{'$in':g.getSvrList()}},{'headdata.svrname':_name})



    @g.m.pathDebug.run
    def run(self):
        # run名字固定，在这里指定执行顺序
        self.svr()




if __name__ == '__main__':
    patch = Patch()
    patch.run()