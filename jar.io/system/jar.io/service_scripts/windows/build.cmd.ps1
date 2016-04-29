$argLen = $args.Count
if ( $argLen -lt 1 -or $argLen -gt 3 ) {
  echo "Usage: build.cmd [ task-guid ] [ make_jar ] [ entrypoint ]"
  exit
}
$guid=$args[ 0 ]
$make_jar=$args[ 1 ]
$entrypoint=$args[ 2 ]
$build= Join-Path -Path $guid -ChildPath target
$classes= Join-Path -Path $build -ChildPath classes
$jar = Join-Path -Path $build -ChildPath jar
$classes_jar = Join-Path -Path $jar -ChildPath "classes.jar"
$executable_jar = Join-Path -Path $jar -ChildPath "executable.jar"

if ( Test-Path $guid -ne $true ) {
  echo "Source $guid directory does not exist."
  exit 
}

echo $guid $make_jar $entrypoint $build
# clean

echo "Cleaning build directory..."

Remove-Item -Path $build -recurse -force

echo "Done."

# make build directories 

echo "Making classes directory..."

New-Item -Path $classes -type directory -force

echo "Done."

if ( $make_jar -eq "make_jar" ) {
  echo "Preparing a jar directory..."

  New-Item -Path $jar -type directory -force

  echo "Done."
}

# make sources

echo "Collecting sources..."

cd $guid
$sources = Get-ChildItem -Path $guid -type file -name | Get-Unique
$sources = $sources -join ", "

echo "Done."

echo "Compiling sources..."

javac $sources -d $classes -verbose

echo "Done."

# if make jar

if ( $make_jar -eq "make_jar" ) {
  if ( $entrypoint -ne "" ) {
    echo "Building an executable jar with entrypoint $entrypoint..." 
    jar cvfe $executable_jar $entrypoint -C $classes . 
    echo "Done."
  } else {
    echo "Building a jar..."
    jar cvf $class_jar -C $classes .
    echo "Done."
  }
}
