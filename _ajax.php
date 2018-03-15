<?php
require_once '_init.php';

// Deny ajax request if user is not authorized
if(!App::isUserLoggedIn()){
    print json_encode('{Unauthorized request}');
    exit;
}

define( 'Sendy_PHP_API_Wrapper', TRUE );

require_once 'server/vendor/class-sendy-php-api.php';

// Prevent direct access to this file
define('IS_AJAX', isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest');
if (!IS_AJAX) {
    die('Restricted access');
}

// Encrypt List ID, taken from 'sendy/includes/helpers/short.php'
function short($in, $to_num = false)
{
    $api_key = SENDY_API_KEY; // Constant from _config.php
    $encryptionMethod = "AES-256-CBC";

    //check if variable is an email
    $is_email = false; // Force to false, since we will pass only numbers

    if($to_num)
    {
        if(version_compare(PHP_VERSION, '5.3.0') >= 0) //openssl_decrypt requires at least 5.3.0
        {
            $decrypted = str_replace('892', '/', $in);
            $decrypted = str_replace('763', '+', $decrypted);

            if(function_exists('openssl_encrypt'))
            {
                $decrypted = version_compare(PHP_VERSION, '5.3.3') >= 0 ? openssl_decrypt($decrypted, $encryptionMethod, $api_key, 0, '3j9hwG7uj8uvpRAT') : openssl_decrypt($decrypted, $encryptionMethod, $api_key, 0);
                if(!$decrypted) return $is_email ? $in : intval($in, 36);
            }
            else return $is_email ? $in : intval($in, 36);

            return $decrypted=='' ? intval($in, 36) : $decrypted;
        }
        else return $is_email ? $in : intval($in, 36);
    }
    else
    {
        if(version_compare(PHP_VERSION, '5.3.0') >= 0) //openssl_encrypt requires at least 5.3.0
        {
            if(function_exists('openssl_encrypt'))
            {
                $encrypted = version_compare(PHP_VERSION, '5.3.3') >= 0 ? openssl_encrypt($in, $encryptionMethod, $api_key, 0, '3j9hwG7uj8uvpRAT') : openssl_encrypt($in, $encryptionMethod, $api_key, 0);
                if(!$encrypted) return $is_email ? $in : base_convert($in, 10, 36);
            }
            else return $is_email ? $in : base_convert($in, 10, 36);

            $encrypted = str_replace('/', '892', $encrypted);
            $encrypted = str_replace('+', '763', $encrypted);
            $encrypted = str_replace('=', '', $encrypted);

            return $encrypted;
        }
        else return $is_email ? $in : base_convert($in, 10, 36);
    }
}

if(isset($_POST['get_lists'])){
    // Get brand id
    $brand_id = isset($_POST['brand_id']) ? $_POST['brand_id'] : '';
    // Get list of the subscriber lists
    $lists = App::DBQuery('SELECT `id`, `name` FROM `lists` where `app`="' . $brand_id . '" ')->fetchAll();
    if(count($lists)<1){
        $response=array(
            'message'	=>	'There is no subscriber lists for this Brand, your campaign will be saved as "Draft".',
            'type'		=>	'success'
        );
    }else {

        // Hash the List ID
        foreach ($lists as &$list) {
            $list['id'] = short($list['id']);
        }

        $response = array(
            'message' => $lists,
            'type' => 'success'
        );
    }
    print json_encode($response);
    exit;
}

if(isset($_POST['get_brand_info'])){
    // Get brand id
    $brand_id = isset($_POST['brand_id']) ? $_POST['brand_id'] : '';
    // Get list of the subscriber lists
    $brand_info = App::DBQuery('SELECT `from_name`, `from_email`, `reply_to` FROM `apps` where `id`="' . $brand_id . '"')->fetch();
    if(!is_array($brand_info)){
        $response=array(
            'message'	=>	array(
                'from_name' => '',
                'from_email' => '',
                'reply_to' => '',
            ),
            'type'		=>	'success'
        );
    }else {

        $response = array(
            'message' => $brand_info,
            'type' => 'success'
        );
    }
    print json_encode($response);
    exit;
}


if(isset($_POST['process_campaign'])){
    // Get brand id
    $brand_id = isset($_POST['brand_id']) ? $_POST['brand_id'] : 0;
    $subject = isset($_POST['subject']) ? $_POST['subject'] : '';
    $from_name = isset($_POST['from_name']) ? $_POST['from_name'] : '';
    $from_email = isset($_POST['from_email']) ? $_POST['from_email'] : '';
    $reply_to = isset($_POST['reply_to']) ? $_POST['reply_to'] : '';
    $plain_text = isset($_POST['plain_text']) ? $_POST['plain_text'] : '';
    $html_text = isset($_POST['html_text']) ? base64_decode($_POST['html_text']) : '';
    $query_string = isset($_POST['query_string']) ? $_POST['query_string'] : '';
    $list_ids = isset($_POST['list_ids']) ? implode(',',$_POST['list_ids']) : '';
    $send_campaign = isset($_POST['send_campaign']) ? $_POST['send_campaign'] : 0;

    $config = array(
        'installation_url' => SENDY_URL,  // Your Sendy installation URL (without trailing slash).
        'api_key'          => SENDY_API_KEY, // Your API key. Aavailable in Sendy Settings.
        'list_id'          => 'dummy'
    );

    $sendy = new \SENDY\Sendy_PHP_API( $config );

    $campaign_settings = array(
        'from_name'     => $from_name,
        'from_email'    => $from_email,
        'reply_to'      => $reply_to,
        'subject'       => $subject,
        'plain_text'    => $plain_text, // (optional).
        'html_text'     => $html_text,
        'brand_id'      => (int)$brand_id, // Required only if you are creating a 'Draft' campaign.
        'send_campaign' => $send_campaign, // Set to 1 if you want to send the campaign as well and not just create a draft. Default is 0.
        'list_ids'      => $list_ids, // Required only if you set send_campaign to 1.
        'query_string'  => $query_string, // Eg. Google Analytics tags.
    );

    $result_array = $sendy->campaign( $campaign_settings );

    $response=array(
        'message'	=>	$result_array,
        'type'		=>	'success'
    );
    print json_encode($response);
    exit;
}




// Display an error in case of direct file call
// Return empty JSON to avoid parse error in javascript
print json_encode('{Ajax error}');
exit;