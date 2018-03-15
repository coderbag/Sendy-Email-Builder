<?php require_once '_init.php';

App::setPage('builder');

require_once '_security.php';

require_once '_header.php';
?>
<div id="email-builder">
    <!-- Main Sidebar -->
    <div class="sidebar-main">
        <div class="sidebar-header">
            <a class="logo-container" href="index.php">
                <img class="logo" src="dist/images/logo.png">
                <span class="title-container">
                        <span class="title"><?php echo APP_NAME;?></span>
                        <span class="subtitle"><?php echo APP_TAGLINE;?></span>
                    </span>
            </a>
        </div>
        <ul class="account-info">
            <li class="nav-item">
                <span class="item" data-action="expand-account"><i class="icon icon-user"></i> <?php echo App::getUserName();?> <i class="icon accountState icon-chevron-down"></i></span>
                <ul class="subnav">
                    <li class="subnav-item"><a href="<?php echo SENDY_URL; ?>" target="_blank"><i class="icon icon-home"></i> Sendy Dashboard</a></li>
                    <li class="subnav-item"><a href="index.php?action=logout"><i class="icon icon-power-off"></i> Logout</a></li>
                </ul>
            </li>
        </ul>
        <ul class="nav" data-type="nav">
            <li class="nav-item active" data-nav="has-child">
                <span class="item"><i class="icon icon-sliders"></i> Edit</span>
                <ul class="subnav" data-type="subnav">
                    <li class="subnav-item" data-target="modules">Modules</li>
                    <li class="subnav-item" data-target="styles">Styles</li>
                </ul>
            <li class="nav-item" data-nav="has-child">
                <span class="item"><i class="icon icon-download"></i> Export</span>
                <ul class="subnav" data-type="subnav">
                    <li class="subnav-item" data-action="export-zip">Zip archive</li>
                    <li class="subnav-item" data-action="export-html">HTML only</li>
                </ul>
            </li>
            <li class="nav-item" data-action="sendy-helpers">
                <span class="item"><i class="icon icon-question-circle"></i> Sendy Tags</span>
            </li>
        </ul>
        <div class="sidebar-footer">
            <a class="btn-main" href="#" data-action="campaign-settings">Save Campaign</a>
            <a class="btn-second" href="theme.php">Choose template</a>
        </div>
    </div>
    <!-- Main Container -->
    <div class="main-container">
        <!-- Second Sidebar -->
        <div class="sidebar-second" data-type="sidebar-second">
            <!-- Modules -->
            <div class="sidebar-inner" data-sidebar="modules">
                <div class="inner-header">DRAG AND DROP MODULES</div>
                <div class="inner-content" data-type="modules-container">
                </div>
            </div>
            <!-- Styles -->
            <div class="sidebar-inner" data-sidebar="styles">
                <div class="inner-header">
                </div>
                <div class="inner-content">
                    <div data-type="module-options">
                    </div><!-- module-options -->
                </div>
            </div>
        </div>
        <!-- Holder Container -->
        <div class="holder-container">
            <!-- Top Sidebar -->
            <div class="sidebar-top">
                <span class="item template-preview-mobile"><i class="icon-mobile"></i></span>
                <span class="item template-preview-tablet"><i class="icon-tablet"></i></span>
                <span class="item template-clear item-last"><i class="icon-close"></i> Clear</span>
            </div>
            <!-- Editor Container -->
            <div class="editor-container">
                <!-- Editor Area -->
                <div class="editor" data-type="editor">

                </div> <!-- /.editor -->
            </div>
        </div>
    </div>
    <form id="export-form" action="server/_export.php" method="POST">
        <input type="hidden" name="type" value="html"/>
        <input type="hidden" name="theme" value="<?php echo $_GET['theme'];?>"/>
        <input id="templateHTML" type="hidden" name="templateHTML" value="" />
    </form> <!-- / Template Export Form  -->
</div>


<div id="linkeditor" class="modal-container">
    <div class="input-group">
        <input class="input-control" type="text" data-link="text" value="" placeholder="Text">
        <input class="input-control" type="text" data-link="url" value="" placeholder="http://example.com">
    </div>
    <div class="modal-controls">
        <button class="modal-btn-cancel">Cancel</button>
        <button class="modal-btn-ok">OK</button>
    </div>
</div>

<div id="imageeditor" class="modal-container">
    <div class="modal-container-inner">
        <div class="input-group">
            <input class="input-control" type="text" data-image="url" value="" placeholder="URL">
            <input class="input-control" type="text" data-image="alt" value="" placeholder="Alt">
            <input class="input-control input-control-small" type="text" data-image="width" value="" placeholder="Width">px X
            <input class="input-control input-control-small" type="text" data-image="height" value="" placeholder="Height">px
        </div>
        <div>
            <div class="slim" id="modal-image-uploader">
                <input type="file" >
                <img src="" alt="" data-image="src">
            </div>
        </div>
    </div>
    <div class="modal-controls">
        <button class="modal-btn-cancel">Cancel</button>
        <button class="modal-btn-ok">OK</button>
    </div>
</div>

<div id="bgeditor" class="modal-container">
    <div class="slim" id="modal-bg-uploader">
        <input type="file" >
        <img src="" alt="" data-image="src">
    </div>
    <div class="modal-controls">
        <button class="modal-btn-cancel">Cancel</button>
        <button class="modal-btn-ok">OK</button>
    </div>
</div>

<div id="sendyhelpers" class="modal-container">
    <h2>Essential tags (HTML only)</h2>
    <p>The following tags can only be used on the HTML version</p>

    <p>Webversion link:</p>
    <pre><webversion>View web version</webversion></pre>

    <p>Unsubscribe link:</p>
    <pre><unsubscribe>Unsubscribe here</unsubscribe></pre>


    <h2>Essential tags</h2>
    <p>The following tags can be used on both Plain text or HTML version</p>

    <p>Webversion link:</p>
    <pre>[webversion]</pre>

    <p>Unsubscribe link:</p>
    <pre>[unsubscribe]</pre>


    <h2>Personalization tags</h2>
    <p>The following tags can be used on both Plain text or HTML version</p>

    <p>Name:</p>
    <pre>[Name,fallback=]</pre>

    <p>Email:</p>
    <pre>[Email]</pre>

    <p>Two digit day of the month (eg. 01 to 31):</p>
    <pre>[currentdaynumber]</pre>

    <p>A full textual representation of the day (eg. Friday):</p>
    <pre>[currentday]</pre>

    <p>Two digit representation of the month (eg. 01 to 12):</p>
    <pre>[currentmonthnumber]</pre>

    <p>Full month name (eg. May):</p>
    <pre>[currentmonth]</pre>

    <p>Four digit representation of the year (eg. 2014):</p>
    <pre>[currentyear]</pre>


    <h2>Custom field tags</h2>

    <p>You can also use custom fields to personalize your newsletter, eg.</p>
    <pre>[Country,fallback=anywhere in the world]</pre>

    <p>To manage or get a reference of tags from custom fields, go to any subscriber list. Then click 'Custom fields' button at the top right.</p>
</div>

<div id="campaignmodal" class="modal-container">
    <div class="input-row">
        <div class="input-group">
            <input class="input-control" type="text" name="subject" value="" placeholder="Subject">
        </div>
        <div class="input-group">
            <?php
            $userAppID = App::getUserApp();

            // Get list of Brands
            if(!$userAppID) {
                $brandQuery = 'SELECT * FROM `apps` where  `userID`= "' . App::getUserID() . '"';
            }else{
                $brandQuery = 'SELECT * FROM `apps` where `id`= "' . $userAppID . '"';
            }

            $brands = App::DBQuery($brandQuery)->fetchAll();
            ?>
            <select class="input-control" name="brand_id" id="brand_id">
                <option value="" disabled selected>Brand</option>
                <?php foreach ($brands as $brand){ ?>
                    <option value="<?php echo $brand['id']?>"><?php echo $brand['app_name']?></option>
                <?php } ?>
            </select>
        </div>
    </div>
    <div class="input-row">
        <div class="input-group">
            <input class="input-control" type="text" name="from_name" value="" placeholder="From Name">
        </div>
        <div class="input-group">
            <input class="input-control" type="email" name="from_email" value="" placeholder="From Email">
        </div>
    </div>
    <div class="input-row">
        <div class="input-group">
            <input class="input-control" type="text" name="reply_to" value="" placeholder="Reply To">
        </div>
        <div class="input-group">
            <input class="input-control" type="text" name="query_string" value="" placeholder="Query String">
        </div>
    </div>

    <div class="input-row">
        <div class="input-group">
            <textarea name="plain_text"></textarea>
        </div>
        <div class="input-group checkbox-wrapper" id="subscribers-list-container">
            Please, choose Brand first. List IDs are required if you want to send a campaign.
        </div>
    </div>
    <div class="input-group">
        <label><input type="checkbox" name="send_campaign" value="1"> Send campaign</label>
    </div>
    <div class="modal-controls">
        <button class="modal-btn-cancel">Cancel</button>
        <button class="modal-btn-ok">OK</button>
    </div>
</div>


<!-- Scripts -->

<!-- App Config -->
<script type="text/javascript">
    var config = {
        host : '<?php echo APP_PATH; ?>',
        uploads : '<?php echo APP_PATH . '/uploads'; ?>',
        send_script : '<?php echo APP_PATH . '/server/_send.php'; ?>',
        upload_script : '<?php echo APP_PATH . '/server/_upload.php'; ?>',
        bg_upload_script : '<?php echo APP_PATH . '/server/_upload.php?type=bg'; ?>'
    }
</script>
<!-- Editor -->
<script src="dist/js/editor.js?ver=<?php echo APP_VERSION; ?>"></script>
<!-- Custom Functions -->
<script src="dist/js/custom.js?ver=<?php echo APP_VERSION; ?>"></script>
<script type="text/javascript">
    var emailBuilder = new $.EmailBuilder({theme: '<?php echo $_GET['theme'];?>'});
    emailBuilder.init();
</script>

<?php require_once '_footer.php'; ?>