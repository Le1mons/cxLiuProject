#!/usr/bin/python
#coding:utf-8

import g
import socketmana
import socketpack

def proc(conn,data):
    _nt = str(g.C.NOW())
    conn.sendAPI("ping",_nt)

