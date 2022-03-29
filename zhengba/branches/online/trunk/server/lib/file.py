#!/usr/bin/python
#coding:utf-8
'''

@author：刺鸟
@email：4041990@qq.com
'''
#写文件
import os
def writeFile(foldname,filename,txt):
	Root=os.getcwd().split('game')[0]
	try:
		if os.path.exists(Root+foldname)==False:
			os.mkdir(Root+foldname)
		f = open(Root+foldname+filename, 'w')
		f.truncate()
		f.write(txt)
		f.close()
	except:
		return -1
	return 1

def readFile (fileName):
	text = ''
	try:
		file_object = open(fileName)
		text = file_object.read()
		file_object.close()
	except:
		pass
	return text