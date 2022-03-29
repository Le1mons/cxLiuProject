#!/usr/bin/python
#coding:utf-8

'''
@author 吴雨寒
@date 2015/3/9
@desc 用于过滤SQL单引号防止注入
'''
#import g
from log import *

class FilterHelper():
    gamelog = None
    def __init__(self):
        self.gamelog=LOG('gamelog','gameServer',True)
    '''过滤对应数据'''
    def filterData(self,code,data):
        if data is None:
            return data
        if(str(data).find('\'')!=-1):
            self.gamelog.info('FilterData called ,code:%s,data:%s' % (code,data))
        return str(data).replace('\'','*')