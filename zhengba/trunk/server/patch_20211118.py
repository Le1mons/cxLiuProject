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
    def tongyu(self):
        _herolist = g.mdb.find("hero", {"star": {"$gte": 10}})
        _userData = {}
        for hero in _herolist:
            _uid = hero["uid"]
            _hid = hero["hid"]
            _star = hero["star"]
            if _uid not in _userData: _userData[_uid] = {}
            if _hid not in _userData[_uid]: _userData[_uid][_hid] = _star
            if _star > _userData[_uid][_hid]:
                _userData[_uid][_hid] = _star

        for uid in _userData:
            for hid, star in _userData[uid].items():
                g.m.herofun.onHeroTongyu(uid,hid,star)


    @g.m.pathDebug.run
    def run(self):
        # run名字固定，在这里指定执行顺序
        self.tongyu()



if __name__ == '__main__':
    patch = Patch()
    patch.run()