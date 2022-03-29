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
    def gonghui_siege4(self):

        g.m.crosscomfun.timer_createOpenDayGroupID()
        #
        _dkey = g.m.gonghuisiegefun.getWeekKey()
        _groupInfo = g.crossDB.find("servergroup", {"dkey": _dkey})
        _group2Info = {}
        if _groupInfo:
            _group2Info = {i["serverid"]: i["gid"] for i in _groupInfo}

        _data = g.crossDB.find("gonghui_siege", {"dkey": _dkey})
        for d in _data:
            _sid = d["sid"]
            _uid = d["uid"]
            _gid = "0"
            if _group2Info:
                _gid = _group2Info.get(str(_sid), "0")
            g.crossDB.update("gonghui_siege", {"dkey": _dkey, "uid": _uid}, {"groupid": _gid})


        _data = g.crossDB.find("gonghui_siege_rank", {"dkey": _dkey})
        for d in _data:
            _sid = d["sid"]
            _ghid = d["ghid"]
            _gid = "0"
            if _group2Info:
                _gid = _group2Info.get(str(_sid), "0")
            if _gid == "0":
                _data2 = g.crossDB.find1("gonghui_siege", {"dkey": _dkey, "ghid":_ghid})
                if _data2:
                    _gid = _data2["groupid"]
            g.crossDB.update("gonghui_siege_rank", {"dkey": _dkey, "ghid": _ghid}, {"groupid": _gid})

    @g.m.pathDebug.run
    def run(self):
        # 道具延期处理
        self.gonghui_siege4()



if __name__ == '__main__':
    patch = Patch()
    patch.run()
