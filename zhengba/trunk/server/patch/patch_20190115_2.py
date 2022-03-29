#!/usr/bin/python
# coding:utf-8


import sys
sys.path.append('game')
import g

print 'competing_upload start ...'
g.m.sess.remove('1830_5beef777df29760730661868', 'USER_TOPZHANLIHERO')
g.m.herofun.chkTopZhanli('1830_5beef777df29760730661868','',1)
print 'competing_upload end ...'