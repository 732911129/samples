if [[ $# -lt 2 || $# -gt 3 ]]; then
  echo "Usage: $0 [ zipfile ] [ task-guid ] [ -q ]"
  echo "-q suppresses all prompts and assumes yes answer."
  exit 1
fi

zip=$1
guid=$2
shift
args="$@"
staging=$guid

# check if the quiet option is set
if [[ ! $@ == *-q* ]]; then
  while true; do
    read -p "Unzip $zip into $staging? ( y/n ) " yn
    case $yn in
      [Yy]* ) unzip $staging/$zip -d $staging; break;;
      [Nn]* ) exit;;
      * ) echo "Please answer yes or no.";;
    esac
  done
else
  echo "Unzipping $zip into $staging..."
  unzip -o $staging/$zip -d $staging
  echo "Unzipped $zip into $staging."
  echo "Done."
fi

