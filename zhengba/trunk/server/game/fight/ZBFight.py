#!/usr/bin/python
# coding:utf-8

# 战斗类

import sys

if __name__ == "__main__":
    sys.path.append("..")

import g, event
import random, string, time, json, uuid, sys, copy
import Fight


# pvp战斗，作为战斗过程的主体的实现类
class ZBFight(Fight.Fight):
    def __init__(self, ftype):
        super(ZBFight, self).__init__(ftype)
        self.game = 'zhengba'

    # 格式化战斗信息
    def fmtFightDataApi(self, roledata):
        _rolebyside = [[], []]
        for d in roledata:
            if 'sqid' in d:  # 不计算神器
                # 获取神器提供的技能
                _skill = g.GC['shenqiskill'][str(d['sqid'])][str(d['djlv'])]['skill']
                d.update({'skill': _skill})
                continue
            if 'pid' in d:
                continue
            _rolebyside[d['side']].append(d)

        # 战斗激活的阵法信息
        _chkzf = g.m.fightfun.getZhenFaBuffId
        # 阵法格式改为  {zfid: index}
        self.zhenfa = [_chkzf(_rolebyside[0]), _chkzf(_rolebyside[1])]
        _zbbuff = [{}, {}]
        if self.zhenfa[0] != {}: _zbbuff[0] = g.m.fightfun.getBuffByZF(self.zhenfa[0])
        if self.zhenfa[1] != {}: _zbbuff[1] = g.m.fightfun.getBuffByZF(self.zhenfa[1])
        for d in roledata:
            if 'sqid' in d or 'pid' in d: continue  # 不计算神器
            _side = d['side']

            if len(_zbbuff[_side]) != 0:
                g.m.fightfun.caleHeroBuffByZhenFa(d, _zbbuff[_side])

            if self.ftype != 'pvm':
                d['maxhp'] = d['hp']

    # 格式化战斗结束的返回数据
    def fmtFightResApi(self, data):
        data['zhenfa'] = self.zhenfa
        # 统计信息
        data['signdata'] = {}
        # 战斗剩余血量信息
        data['fightres'] = {}
        # 攻守防的总输出
        data['dpsbyside'] = [0, 0]
        for role in self.roles:
            data['signdata'][role.rid] = role.signData
            data['fightres'][role.rid] = Fight.deepCopy(role.data)
            data['dpsbyside'][role.data['side']] += role.signData['dps']

        for role in self.artifaces:
            data['signdata'][role.rid] = role.signData
            data['fightres'][role.rid] = Fight.deepCopy(role.data)
            data['dpsbyside'][role.data['side']] += role.signData['dps']

        for role in self.pets:
            # data['signdata'][role.rid] = role.signData
            data['fightres'][role.rid] = Fight.deepCopy(role.data)
            data['dpsbyside'][role.data['side']] += role.signData['dps']

            # 设置小兵的hp信息（对于继承血量的战斗）

    # pos2hp：位置对应的血量 {"1":1233}
    def setRoleHp(self, side, pos2hp):
        _deadRole = []
        _deadHappend = False

        # 如果是援军
        if 'yj' in pos2hp:
            for role in self.roles:
                if role.data['side'] != side:
                    continue
                if role.data['pos'] == 7:
                    role.data['pos'] = pos2hp['yj']
                    role.data['dead'] = False
                    role.data['ready'] = True
                    self._rolesInfo[role.rid]['pos'] = role.data['pos']
                    del pos2hp['yj']
                elif role.data['pos'] == pos2hp['yj']:
                    role.data['pos'] = 7

        for role in self.roles:
            if role.data['side'] != side:
                continue
            _pos = str(role.data['pos'])
            if _pos in pos2hp:
                if pos2hp[_pos] <= 0:
                    role.data['hp'] = 0
                    role.data['dead'] = True
                    del self._rolesInfo[role.rid]
                    _deadHappend = True
                else:
                    role.data['hp'] = pos2hp[_pos]
                    self._rolesInfo[role.rid]['hp'] = pos2hp[_pos]

        if _deadHappend:
            self.f5PosInfo()

    def setSZJRoleHp(self, side, pos2hp):
        _deadRole = []
        _deadHappend = False

        # 如果是援军
        if 'yj' in pos2hp:
            for role in self.roles:
                if role.data['side'] != side:
                    continue
                if role.data['pos'] == 7:
                    role.data['pos'] = pos2hp['yj']
                    role.data['dead'] = False
                    role.data['ready'] = True
                    self._rolesInfo[role.rid]['pos'] = role.data['pos']
                elif role.data['pos'] == pos2hp['yj']:
                    role.data['pos'] = 7

        for role in self.roles:
            if role.data['side'] != side:
                continue
            _pos = str(role.data['pos'])
            if _pos in pos2hp:
                if pos2hp[_pos] <= 0:
                    role.data['hp'] = 0
                    role.data['dead'] = True
                    del self._rolesInfo[role.rid]
                    _deadHappend = True
                else:
                    role.data['hp'] = self._rolesInfo[role.rid]['maxhp'] * pos2hp[_pos] * 0.01
                    self._rolesInfo[role.rid]['hp'] = self._rolesInfo[role.rid]['maxhp'] * pos2hp[_pos] * 0.01

        if _deadHappend:
            self.f5PosInfo()

    # pos2nuqi：位置对应的怒气 {"1":1233}
    def setRoleNuqi(self, side, pos2nuqi, ftype='shizijun'):
        _deadRole = []
        for role in self.roles:
            if role.data['side'] != side:
                continue
            _pos = str(role.data['pos'])
            if _pos in pos2nuqi:
                if ftype == 'maze':
                    pos2nuqi[_pos] = min(100, pos2nuqi[_pos])
                role.data['nuqi'] = pos2nuqi[_pos]

                if role.rid in self._rolesInfo:
                    # if self._rolesInfo[role.rid]['nuqi'] == 50:
                    # 如果没有经过别的技能增加过怒气
                    self._rolesInfo[role.rid]['nuqi'] = pos2nuqi[_pos]
                    # else:
                    #     # 有别的技能增加怒气
                    #     self._rolesInfo[role.rid]['nuqi'] += pos2nuqi[_pos] - 50


if __name__ == '__main__':

    with open("demofight.json", 'r') as load_f:
        fightData = json.load(load_f)


    # a = [1,2,3,4,5]
    # print a[:2]
    def xxx():
        f = ZBFight('pve')
        a = f.initFightByData(fightData).start()


    i = 1
    while 1:
        xxx()
        print i
        i += 1

    # f.dumpRole( f.orderRoles('atk',True) )
    # print f.getRolesByKV({"side":1})

