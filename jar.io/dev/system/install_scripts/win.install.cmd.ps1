
$jdk_installer = "jdk_install.exe"

echo "Checking if JDK is downloaded..."
if ( ( Test-Path $jdk_installer ) -eq $false ) {
  echo "JDK not downloaded. Downloading..."
  Start "http://download.oracle.com/otn-pub/java/jdk/8u77-b03/jdk-8u77-windows-x64.exe"
  echo "Done."
}
echo "JDK is downloaded."

