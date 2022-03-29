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
    def svr1(self):
        uid = '42260_5f77dbbc48fc7020dbf03258'
        _key = g.m.crosswzfun.getDKey()
        _res = g.mc.get('crosswz_ugid_{0}_{1}'.format(_key, uid))
        if _res is None:
            _own = g.crossDB.find1('wzbaoming', {'uid': uid, 'dkey': _key}, fields=['ugid', '_id'])
            if _own:
                _res = _own['ugid']
                # g.mc.set('crosswz_ugid_{0}_{1}'.format(_key, uid), _res, 24 * 3600)
            else:
                openDay = g.m.crosswzfun.getDOpenDay()
                _res = g.m.crosswzfun.getGroupIdx(openDay) + 1

        print 'ugid:', _res

        if _res:
            mcKey = "WANGZHEDLD256RANK_{0}".format(_res)
        else:
            mcKey = "WANGZHEDLD256RANK_{0}".format(3)
        _rankData = g.crossMC.get(mcKey)
        # if _rankData != None:
        #     return _rankData
        _where = {'dkey': _key, 'ugid': _res}
        print '_where', _where
        _rankData = g.crossDB.find('wzbaoming', _where, sort=[["jifen", -1], ['zhanli', -1], ['ctime', 1]],
                                   fields=['_id', 'uid', 'jifen', 'zhanli'], limit=256)
        print _rankData
        # g.crossMC.set(mcKey, _rankData, time=10)
        # return _rankData



    @g.m.pathDebug.run
    def run(self):
        # run名字固定，在这里指定执行顺序
        self.svr1()




if __name__ == '__main__':
    patch = Patch()
    patch.run()