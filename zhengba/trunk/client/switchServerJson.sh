#!/usr/bin/env bash

url=$(svn info | grep Root:)
http=${url#*: }
#echo ${url#*: }
cd ../server/samejson/
svn switch $http/client/res/samejson --ignore-ancestry