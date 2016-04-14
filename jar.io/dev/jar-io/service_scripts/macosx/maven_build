guid=$1
run_package=$2

cd $guid

# clean

echo "Cleaning build directory..."
mvn clean

# building with maven

echo "Building with maven..."
mvn compile

# testing

echo "Testing with maven..."
mvn test

if [[ $run_package == *run_package* ]]; then
  echo "Running package..."
  mvn package
fi

echo "Done."

