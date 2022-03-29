#!/usr/bin/python
# coding:utf-8

# 战斗类
import FightRole


class FightRole_MoWang(FightRole.FightRole):
    def __init__(self, fight):
        super(FightRole_MoWang, self).__init__(fight)

        self.setAttr('lockNuQi', True)
        self.setAttr('lockHP', True)

    def initRoleByData(self, roleData):
        super(FightRole_MoWang, self).initRoleByData(roleData)
        # 召唤傀儡类boss  需要先记录对面的英雄的属性
        if self.data['mowangtype'] == '99':
            _kuilei = []
            self.rids = []
            _pro = 0
            for i in self.getPassiveSkill('kuilei'):
                if i.conf['chkdata']['when'] == 'roundend':
                    _pro = i.conf['v']['pro']
                    break
            else:
                return self

            for i in self.fight.roles:
                # 对方
                if i.data['side'] != self.data['side'] and i.data['ready']:
                    _role = FightRole.FightRole(self.fight)
                    _data = i.data.copy()
                    _data['hp'] = _data['maxhp'] * _pro / 1000.0
                    _data['atk'] *= _pro / 1000.0
                    _data['dead'] = True
                    _data['ready'] = False
                    _data['side'] = self.data['side']
                    _data['speed'] *= _pro / 1000.0
                    _data['maxhp'] = _data['hp']
                    _role.initRoleByData(_data, False)
                    self.rids.append(_role.rid)
                    _kuilei.append(_role)

            self.fight.roles += _kuilei

        # # 进度槽类boss  满了boss就输了
        elif self.data['mowangtype'] == '98':
            if self.data.get('ismowang'):
                self.data['ready'] = False


        # 每回合招小弟的魔王类型
        if self.data['mowangtype'] == '97':
            _kuilei = []
            self.rids = []

            # if not self.getPassiveSkill('call'):
            #     return

            for i in self.fight.roles:
                # 对方
                if i.data['side'] == self.data['side'] and i.data['ready'] and not i.data.get('ismowang'):
                    i.data['dead'] = True
                    i.data['ready'] = False
                    self.rids.append(i.rid)

        return self


if __name__ == '__main__':
    a = [1, 2, 3]
    a.extend([4, 5, 6])
    print a
