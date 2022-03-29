#!/usr/bin/python
#encoding=utf-8

import sys,shutil,os

for s in os.listdir('./res/spine/'):
    if os.path.splitext(s)[1] == '.json':
        file_object = open('./res/spine/'+s)
        text = file_object.read()
        if text.find('"hit"')==-1:
            print 'nohit',s
        else:
            if len(text.split('"hit"')) != 3:
                print 'hit more',s