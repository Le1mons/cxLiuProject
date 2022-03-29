#!/usr/bin/python
#coding:utf-8
import g

class Session:
	def __init__ (self,preKey):
		self.preKey = preKey
	
	def makeKey (self,key):
		return self.preKey+"_"+key

	def get (self,k):
		return g.mc.get(self.makeKey(k))
	
	def set (self,k,v,t=0):
		return g.mc.set(self.makeKey(k),v,t)

	def remove (self,k):
		return g.mc.delete(self.makeKey(k))

def makeKey (uid,key):
	uid = str(uid)
	return uid+"_"+key

def get (uid,k):
	_nk = makeKey(uid,k)
	return g.mc.get(_nk)

def set (uid,k,v,t=0):
	return g.mc.set(makeKey(uid,k),v,t)

def remove (uid,k):
	return g.mc.delete(makeKey(uid,k))
