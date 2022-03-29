#!/usr/bin/python
#coding:utf-8

#战斗类
import FightRole

class FightRole_MoWang(FightRole.FightRole):
    def __init__ (self,fight):
        super(FightRole_MoWang, self).__init__(fight)
        
        self.setAttr('lockNuQi',True)
        self.setAttr('lockHP',True)
    
if __name__ == '__main__':
    a = [1,2,3]
    a.extend([4,5,6])
    print a
