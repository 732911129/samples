if [[ $# -ne 2 ]]; then
  echo "Usage: $0 [ task-guid ] [ zipbase ]"
  exit 1
fi

guid=$1
zipbase=$2
zip=compiled.$zipbase.zip

echo "zipping $guid into $guid/$zip..."
cd $guid
zip -vr $zip *;
echo "zipped $guid into $guid/$zip."
echo "Done."

