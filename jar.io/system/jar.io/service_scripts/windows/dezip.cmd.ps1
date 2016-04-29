param( 
    [parameter( Position = 0 )]
    [String]
    $zip,

    [parameter( Position = 1 )]
    [String]
    $guid,

    [parameter( Mandatory = $false )]
    [Switch]
    $q
  )

$staging=$guid
$zipPath = Join-Path -Path $staging -ChildPath $zip

echo "Unzipping $zipPath into $staging..."
Expand-Archive $zipPath -dest $staging
echo "Unzipped $zipPath into $staging."
echo "Done."

