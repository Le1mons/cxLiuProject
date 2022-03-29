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
    def gpjjcfightNum(self):
        all = g.mdb.find('gamelog', {'type': 'shipin_awake', 'data.diffattr': {'$exists': 0}}, fields=['_id', 'uid'])
        for uid in set(map(lambda x:x['uid'], all)):
            _alle = g.mdb.find('equiplist', {'uid': uid, 'usenum': {'$gt': 0}},fields=['eid', 'num', 'usenum', 'type'])
            for equip in _alle:
                _hnum = g.mdb.count('hero', {'weardata.{}'.format(equip['type']): equip['eid'], 'uid': uid})
                if _hnum != equip['usenum']:
                    g.mdb.update('equiplist',{'_id':equip['_id']},{'usenum':_hnum})


    @g.m.pathDebug.run
    def run(self):
        # 公平竞技场战斗次数刷新脚本
        self.gpjjcfightNum()


if __name__ == '__main__':
    patch = Patch()
    patch.run()