<?php
/* Web App Main Class */

// Singleton
class App
{

    // Database connection
    private static $db = null;


    // Current page
    private static $page = 'dashboard';

    // Page Titles <title></title>
    private static $pageTitles = [
        'theme'          	    => 'Choose campaign theme',
        'builder'         	    => 'Create new campaign',
        'login'  				=> 'Authorization'
    ];

    /**
     * @var Singleton The reference to *Singleton* instance of this class
     */
    private static $instance;

    /**
     * Returns the *Singleton* instance of this class.
     *
     * @return Singleton The *Singleton* instance.
     */
    public static function getInstance()
    {
        if (null === static::$instance) {
            static::$instance = new static();
        }

        return static::$instance;
    }
    /**
     * Protected constructor to prevent creating a new instance of the
     * *Singleton* via the `new` operator from outside of this class.
     */
    protected function __construct()
    {
    }
    /**
     * Private clone method to prevent cloning of the instance of the
     * *Singleton* instance.
     *
     * @return void
     */
    private function __clone()
    {
    }
    /**
     * Private unserialize method to prevent unserializing of the *Singleton*
     * instance.
     *
     * @return void
     */
    private function __wakeup()
    {
    }

    /** VIEW FUNCTIONS **/

    // Set current page
    public static function setPage( $page ){
        self::$page = $page;
    }

    // Get current page
    public static function getPage(){
        return self::$page;
    }

    // Display page title according to current page
    public static function displayPageTitle(){
        echo isset( self::$pageTitles[self::$page] ) ? self::$pageTitles[self::$page] : self::$pageTitles['builder'];
    }



    /** USER FUNCTIONS **/

    // Check if the user is logged in
    public static function isUserLoggedIn(){
        if ( isset( $_SESSION['user_id'] ) ) {
            return true;
        }
        return false;
    }


    // Get current user information
    // if $attr is passed - return specific attribute
    // otherwise - return whole array
    public static function getUserInfo($attr = null){
        if ( !self::isUserLoggedIn() ) {
            return false;
        }

        $result = self::DBQuery('SELECT * FROM `login` where `id`= "' . $_SESSION['user_id'] . '" LIMIT 1')->fetch();
        if(is_array($result)){
            if(!$attr) {
                return $result;
            }
            if(array_key_exists($attr, $result)){
                return $result[$attr];
            }
        }

        return false;
    }


    // Get user ID
    public static function getUserID(){
        return self::getUserInfo('id');
    }

    // Get user App ID
    public static function getUserApp(){
       return self::getUserInfo('app');
    }

    // Get user name
    public static function getUserName(){
        return self::getUserInfo('name');
    }

    // Get user company
    public static function getUserCompany(){
        return self::getUserInfo('company');
    }

    // Get user email
    public static function getUserEmail(){
        return self::getUserInfo('username');
    }


    // Do user logout
    public static function doUserLogout(){
        $_SESSION['user_id'] = '';
        unset( $_SESSION['user_id'] );
    }

    /** THEME/TEMPLATE FUNCTIONS **/
    // Get list of available email templates
    // return array with template slug and name
    public static function getTemplates(){
        $result = array();
        $templates = array_filter(glob('templates/*'), 'is_dir');
        foreach ($templates as $template){
            $template_slug = basename($template);

            $template_name = str_replace('_', ' ', $template_slug);
            $template_name = str_replace('-', ' ', $template_name);
            $template_name = ucwords($template_name);
            $tmp = array(
                'slug'=> $template_slug,
                'name'=> $template_name
            );

            array_push($result, $tmp);
        }
        return $result;
    }

    /** DATABASE FUNCTIONS **/
    // Connect to database
    public static function DBConnect($db_name, $db_user, $db_password, $db_host = '127.0.0.1'){
        $db_host = $db_host ? $db_host : '127.0.0.1';
        /* Connect to a MySQL database using driver invocation */
        $dsn = 'mysql:dbname=' . $db_name . ';host=' . $db_host . ';charset=utf8';

        try {
            self::$db = new PDO($dsn, $db_user, $db_password);
        } catch (PDOException $e) {
            echo 'Connection failed: ' . $e->getMessage();
            die();
        }
    }

    // SQL Query
    public static function DBQuery( $q ){
        $q = self::$db->query($q );
        return $q;
    }

    // Insert Records, Inserted ID will be returned
    public static function DBExecute( $q ){
        self::$db->exec($q );
        $inserted_id = self::$db->lastInsertId();
        return $inserted_id;
    }

}
