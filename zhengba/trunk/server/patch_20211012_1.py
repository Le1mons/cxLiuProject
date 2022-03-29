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
    def huodong(self):
        _hdid = 1633961041
        _hdinfo = g.mdb.find1("hdinfo", {"hdid":_hdid})
        if not _hdinfo:
            return
        _hddatas = g.mdb.find("hddata", {"hdid":_hdid})
        for _hd in _hddatas:
            _uid = _hd["uid"]
            _num = 0
            _pays = g.mdb.find("rmbmoneylog", {"uid":_uid, "ctime":{"$gte": 1633968000}})
            for pay in _pays:
                _num += int(pay["rmbmoney"])
            if _num > 0:
                g.m.huodongfun.setHDData(_uid, _hdid, {'val': _num})




    @g.m.pathDebug.run
    def run(self):
        # 道具延期处理
        self.huodong()


if __name__ == '__main__':
    patch = Patch()
    patch.run()