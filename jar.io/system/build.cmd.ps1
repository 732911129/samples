echo "Running maven clean..."
# Uncomment to use the latest versions
# mvn clean versions:use-latest-versions
mvn clean
echo Done.
echo "Running maven compile..."
mvn compile
echo Done.
echo "Running maven package..."
mvn package
echo Done.
