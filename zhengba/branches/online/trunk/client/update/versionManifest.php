<?php
setFile('log.txt',json_encode($_REQUEST)."\r\n");
$clientVer = r('clientver');
if(isn($clientVer))exit();

$retuenVersion = $VERSION;
if($clientVer*1 > $VERSION){
	//如果客户端版本比服务端版本还高
	$retuenVersion = $clientVer;
}

$RES = array(
	'packageUrl'=> 'http://hommupdate.legu.cc/update/zip',
	#'packageUrl'=> HTTP().'/zip',
	'remoteManifestUrl' => HTTP().'/?app=projectManifest&clientver='.$retuenVersion,
	'remoteVersionUrl' => HTTP().'/?app=versionManifest&clientver='.$retuenVersion,
	'version' => ''.$retuenVersion,
	'engineVersion' => 'Cocos2d-JS V3.9',
);
we(json_encode($RES));
?>