$guid=$args[ 0 ]
$run_package=$args[ 1 ]

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

if ( $run_package -eq "run_package" ) {
  echo "Running package..."
  mvn package
}

echo "Done."

