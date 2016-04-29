if [[ $# -lt 3 || $# -gt 3 ]]; then
  echo "Usage: $0 [ node ] [ service1 ] [ service2 ]"
  exit 1
fi

node=$1
s1=$2
s2=$3
source=$s1/$node
dest=$s2/$node

if [[ ! -e $source ]]; then
  echo "Source $source does not exist."
  exit 1
elif [[ ! -d $source ]]; then
  echo "Source exists but is not a directory."
  exit 1
fi

if [[ -e $dest ]]; then
  echo "Destination exists, deleting..."
  rm -rf $dest
  echo "Done."
fi

if [[ ! -e $s2 ]]; then
  echo "Making destination root...."
  mkdir -p $s2
  echo "Done."
fi

echo "Copying $source to $dest..."
cp -r $source $dest
echo "Done."


