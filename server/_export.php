<?php
/**
 * JS Email Builder
 * Export Template
 *
 * Product Homepage: http://getemailbuilder.com
 * Author: DigitalWheat
 * Author URI: http://digitalwheat.com
 * Version: 1.0.0
 *
 */
 
 
// Include config
require_once '_config.php';

if( isset($_POST['type']) ){
    $type = $_POST['type'];
    $template = $_POST['theme'];

    switch($type){
        case 'html':
         //   header("Content-Disposition: attachment; filename=\"" . basename($File) . "\"");
        //    header("Content-Type: application/force-download");
          //  header("Content-Length: " . filesize($File));
         //   header("Connection: close");

           //header("Content-type: text/plain");
            header("Content-type: application/force-download");
            header("Content-Disposition: attachment; filename=htmltemplate.html");
            //header("Connection: close");


            print base64_decode($_POST['templateHTML']);
            exit();
            break;
        case 'zip':
            // Prepare File
            $file = @tempnam("tmp", "zip");
            $zip = new ZipArchive();
            $zip->open($file, ZipArchive::OVERWRITE);

            // Stuff with content
            $templateHTML = base64_decode($_POST['templateHTML']);
            $usedImages = array();
            // Get used images
            preg_match_all('#([^/]+)\.jpg|jpeg|png|gif#i', $templateHTML, $usedImages );
            // Remove repeated images
            $usedImages = array_unique($usedImages[0]);
            // Transform list of used images into string
            $usedImages = implode(',', $usedImages);
            $newImgBase = 'img';
            // Change absolute image paths to relative across all img tags
            $templateHTML = preg_replace('#(<img.*src=")[^"]+(\/(.*)">)#i', "$1{$newImgBase}$2", $templateHTML);
            // Change absolute image paths to relative across all background images
            $templateHTML = preg_replace('#(<.*background=")[^"]+(\/(.*)">)#i', "$1{$newImgBase}$2", $templateHTML);
            $templateHTML = preg_replace('#(<.*style=".*url\("|\'|\&quot;)[^"]+(\/(.*)\).*"|\'|\&quot;>)#i', "$1{$newImgBase}$2", $templateHTML);
          //  echo $templateHTML;die();
            $zip->addFromString('index.html', $templateHTML);
         //   $zip->addFile('file_on_server.ext', 'second_file_name_within_archive.ext');
            $options = array('add_path' => 'img/', 'remove_all_path' => TRUE);
           // $zip->addGlob('uploads/*.{jpg,jpeg,gif,png}', GLOB_BRACE, $options);
            // Add used images only
            $zip->addGlob( '../uploads/{' . $usedImages . '}', GLOB_BRACE, $options);

            $options = array('add_path' => 'img/', 'remove_all_path' => TRUE);
            $zip->addGlob('../templates/' . $template . '/img/{'. $usedImages .'}', GLOB_BRACE, $options);

            // Close and send to users
            $zip->close();
            header('Content-Type: application/zip');
            header('Content-Length: ' . filesize($file));
            header('Content-Disposition: attachment; filename="template.zip"');
            readfile($file);
            unlink($file);
            exit();
            break;
    }

}