#!/usr/bin/env python
# coding:utf-8

import sys,os,time

sys.path.append('game')
import g,starup

def main (game,dbid):
    #删除开区活动
    print g.mdb.delete('hdinfo',{"hdid":{"$lt":1000000}})
    #删除周常活动
    print g.mdb.delete('hdinfo',{"htype":14})
    #更新config.py
    os.system('wget -O ./config.py http://gametools.legu.cc/?app=editserver\&act=createconfig\&game={0}\&id={1}\&nopre=1'.format(game,dbid))
    #starup
    starup.startUp()

if __name__=='__main__':
    print 'sys.argv',sys.argv
    if len(sys.argv)>=3:
        main(sys.argv[1],sys.argv[2])
    else:
        print 'python ./resetopentime.py game dbid'

