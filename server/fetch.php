<?php
/**
 * Email Builder
 * File fetcher
 *
 * Product Homepage: http://getemailbuilder.com
 * Author: DigitalWheat
 * Author URI: http://digitalwheat.com
 *
 */

// Uncomment if you want to allow posts from other domains
// header('Access-Control-Allow-Origin: *');
require_once('slim.php');


// Get the requested remote url from the post
$url = $_GET['url'];


// Get the image data
// Will stop fetching at the 10 megabyte mark
$data = Slim::fetchURL($url, 10485760); 


// No support for "allow_url_open"
if ($data === null) {
    Slim::outputJSON(array(
        'status' => SlimStatus::FAILURE,
        'message' => 'URL load failed, "allow_url_fopen" is not enabled. Add "allow_url_fopen = On" to your php.ini file.'
    ));
    return;
}


// Something else went wrong (for instance, remote server is down)
if ($data === false) {
    Slim::outputJSON(array(
        'status' => SlimStatus::FAILURE,
        'message' => 'URL load failed for unknown reasons.'
    ));
    return;
}


// get the file name from the url
$name = basename($_SERVER['REQUEST_URI'], '?' . $_SERVER['QUERY_STRING']);


// If you want to store the file in another directory pass the directory name as the third parameter.
// $file = Slim::saveFile($data, $name, 'my-directory/');
$file = Slim::saveFile($data, $name);
$filename = $file['path'];


// Test if file is safe for use
$type = finfo_file(finfo_open(FILEINFO_MIME_TYPE), $filename);

if (
    // is it not an image
    !(substr($type, 0, 6) === 'image/')
) {
    
    // remove file
    if (file_exists($filename)) {
       unlink($filename);
    }
    
    // echo error
    Slim::outputJSON(array(
        'status' => SlimStatus::FAILURE,
        'message' => 'URL load failed for unknown reasons.'
    ));
    
    return;
}

// return name of file on server
Slim::outputJSON(array(
    'status' => SlimStatus::SUCCESS,
    'body' => $filename
));