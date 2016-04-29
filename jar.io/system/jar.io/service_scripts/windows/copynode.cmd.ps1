$argLen = $args.Length

if ( $argLen -ne 3 ) {
  echo "Usage: copynode.cmd [ node ] [ source ] [ dest ]"
  exit
}

$node=$args[ 0 ]
$s1=$args[ 1 ]
$s2=$args[ 2 ]
$source= Join-Path -Path $s1 -ChildPath $node
$dest= Join-Path -Path $s2 -ChildPath $node

if ( Test-Path $dest ) {
  echo "$dest exists. Deleting..."
  Remove-Item -Force -Path $dest -Recurse
  echo "Done."
}

echo "Making $dest parent..."
New-Item -Force -Type directory -Path $s2
echo "Done."

echo "Copying $source to $dest..."
Copy-Item $source $dest -recurse
echo "Done."


