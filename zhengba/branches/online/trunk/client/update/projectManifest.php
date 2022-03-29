<?php
require('zip.class.php');
$clientVer = r('clientver');


$RES = array(
	'packageUrl'=> 'http://hommupdate.legu.cc/update/zip',
	#'packageUrl'=> HTTP().'/zip',
	'remoteManifestUrl' => HTTP().'/?app=projectManifest&clientver='.$VERSION,
	'remoteVersionUrl' => HTTP().'/?app=versionManifest&clientver='.$VERSION,
	'version' => ''.$VERSION,
	'engineVersion' => 'Cocos2d-JS V3.9',
	'searchPaths' => array(),
	'assets' => array()
);

//对比版本
function checkVersion(){
	global $VERSION,$clientVer,$RES;
	//版本相同
	if($clientVer*1 >= $VERSION*1)exit();
	$zipName = zipName($clientVer,$VERSION);	
	//we($zipName);
	//$RES['assets']['game.zip']['md5'] = "v".time();
	//$RES['assets']['game.zip']['compressed'] = true;

	//$RES['assets']['src/game.min.js']['md5'] = "v".time();

	//生成或获取zip补丁
	
	if(is_file('./zip/'.$zipName)){
		$RES['assets'][$zipName]['md5'] = filemtime('./zip/'.$zipName);
		$RES['assets'][$zipName]['compressed'] = true;
	}else{
		$zip = ZIP($clientVer,$VERSION);
		if($zip){
			$RES['assets'][$zip]['md5'] = filemtime('./zip/'.$zip);
			$RES['assets'][$zip]['compressed'] = true;
		}
	}
	we(str_replace('\/','/',json_encode($RES)));
}

//遍历目录
function listDir($dir){
    $dir .= substr($dir, -1) == '/' ? '' : '/';
    $dirInfo = array();
    foreach (glob($dir.'*') as $v) {
        if(is_dir($v)){
            $dirInfo = array_merge($dirInfo, listDir($v,$ext));
        }else{
			$dirInfo[] = $v;
		}
    }
    return $dirInfo;
}

//生成zip包
function ZIP($from,$to){
	global $plat;
	$PACK = 'pack/';
	$dir = scandir($PACK);
	$resDir = array();
	foreach($dir as $d){
		if($d=='.')continue;
		if($d=='..')continue;
		if(!is_dir($PACK.$d))continue;
		if((int)$d<=(int)$from)continue;
		if((int)$d>(int)$to)continue;
		$resDir[] = $d;
	}
	if(count($resDir)==0)return false;
	sort($resDir,SORT_NUMERIC);
	
	$zipName = zipName($from,$to);

	$zipArr = array();
	$ZIP = new PHPZip();
	//we($resDir);
	foreach($resDir as $d){
		$fileList = listDir($PACK.$d);
		foreach($fileList as $f){
			$zipFileName = str_replace($PACK.$d.'/','',$f);
			
			$nameArr = explode('/',$zipFileName);
			if(count($nameArr)>1){
				$__s = '';
				for($_i=0;$_i<count($nameArr)-1;$_i++){
					$__s .= $nameArr[$_i].'/';
					$zipArr[$__s]="~MENU~";
				}
			}
			
			$zipArr[$zipFileName] = $f;
		}
	}
	//we($zipArr);
	$ZIP->ZipByArray($zipArr,'./zip/'.$zipName);

	/*$zip = new ZipArchive();
	if ($zip->open($zipName, ZipArchive::OVERWRITE) === TRUE) {
		foreach($resDir as $d){
			$fileList = listDir($PACK.$d);
			foreach($fileList as $f){
				$zipFileName = str_replace($PACK.$d.'/','',$f);
				$zip->addFile($f,$zipFileName);
			}
		}
		$zip->close();
	}*/
	return $zipName;
}

checkVersion();
?>