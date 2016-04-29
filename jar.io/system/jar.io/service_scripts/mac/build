if [[ $# -lt 1 || $# -gt 3 ]]; then
  echo "Usage: $0 [ task-guid ] [ make_jar ] [ entrypoint ]"
  exit 1
fi

guid=$1
make_jar=$2
entrypoint=$3
build=$guid/target

if [[ ! -e $guid ]]; then
  echo "Source $guid directory does not exist."
  exit 1
elif [[ ! -d $guid ]]; then
  echo "Source $guid directory exists but is not a directory."
  exit 1
fi

echo $guid $make_jar $entrypoint $build
# clean

echo "Cleaning build directory..."

rm -rf $build

echo "Done."

# make build directories 

echo "Making classes directory..."

mkdir -p $build/classes

echo "Done."

if [[ $make_jar == *make_jar* ]]; then
  echo "Preparing a jar directory..."

  mkdir -p $build/jar

  echo "Done."
fi

# make sources

echo "Collecting sources..."

cd $guid
find . -name "*.java" > sources.txt

echo "Done."

echo "Compiling sources..."

javac @sources.txt -d $build/classes -verbose

echo "Done."

echo "Cleaning up..."

rm sources.txt

echo "Done."

# if make jar

if [[ $make_jar == *make_jar* ]]; then
  if [[ $entrypoint != "" ]]; then
    echo "Building an executable jar with entrypoint $entrypoint..." 
    jar cvfe ./target/jar/executable.jar $entrypoint -C ./target/classes . 
    echo "Done."
  else
    echo "Building a jar..."
    jar cvf ./target/jar/classes.jar -C ./target/classes . 
    echo "Done."
  fi
fi
