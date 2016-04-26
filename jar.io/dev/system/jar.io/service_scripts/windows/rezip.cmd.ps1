$argLen = $args.Count
if ( $argLen -ne 2 ) {
  echo "Usage: rezip.cmd [ task-guid ] [ zipbase ]"
  exit 
}

$guid=$args[ 0 ]
$zipbase=$args[ 1 ]
$zip="compiled." + $zipbase + ".zip"
$zipPath = Join-Path -Path $guid -ChildPath $zip

if ( Test-Path $zipPath ) {
  echo "$zipPath exists. Deleting..."
  Remove-Item $zipPath -force
}

echo "zipping $guid into $zipPath..."
cd $guid
Compress-Archive -Path $guid -Update -DestinationPath $zipPath
echo "zipped $guid into $zipPath."
echo "Done."

