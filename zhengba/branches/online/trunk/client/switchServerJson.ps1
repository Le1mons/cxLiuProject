# set-ExecutionPolicy RemoteSigned

$cd_dir="../server/samejson/"

$switch_dir="client/res/samejson"

if ($args){$switch_dir=$args}

"cd $cd_dir"
cd $cd_dir



$svninfo=svn info
$repositoryroot = ($svninfo[4] -replace "Repository Root: ", "") + "/" + $switch_dir

"svn $repositoryroot . --ignore-ancestry"

$svnsw=svn switch $repositoryroot . --ignore-ancestry

$svnsw

# cd ..

Read-Host -Prompt "Press Enter to continue"