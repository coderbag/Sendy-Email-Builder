'use strict';

// Global Event Emitter
var emitter = window.top.jsEmailBuilderEmitter;

// Content Editor
var ContentEditor = {

    editorText: null,
    editorLink: null,
    editorImage: null,
    imageUploader: null,

    init: function () {

        $('[data-editable="link"]').off('click', this.linkEditor);
        $('[data-editable="image"]').off('click', this.imageEditor);

        this.textEditor();
        $('[data-editable="link"]').on('click', this.linkEditor);
        $('[data-editable="image"]').on('click', this.imageEditor);
    },

    // Text Editor
    textEditor: function () {
        this.editorText = new MediumEditor('[data-editable="text"]',{
            toolbar: {
                buttons: ['bold', 'italic', 'underline', 'anchor']
            }
        });
    },

    // Link Editor
    linkEditor: function (event) {
        var $target = $(event.target),  // Current Link (target element)
        modalContainer = $('#linkeditor'),  // Modal Container
        targetLinkText =  $.trim($target.html()), // Currrent Link Text
        targetLinkURL = $target.attr('href'); // Current Link URL

        // Fill-in Modal Form with Link attributes
        $('[data-link="text"]', modalContainer).val(targetLinkText);
        $('[data-link="url"]', modalContainer).val(targetLinkURL);

        $.fancybox.open({
            src  : '#linkeditor',
            type : 'inline',
            opts : {
                afterClose: function(){
                    // Clear the modal form
                    $('[data-link="text"]', modalContainer).val('');
                    $('[data-link="url"]', modalContainer).val('');
                },
                onComplete : function() {
                    // Remove previous on-click event listeners
                    $('.modal-btn-cancel', modalContainer).off('click');
                    $('.modal-btn-ok', modalContainer).off('click');

                    $('.modal-btn-cancel', modalContainer).on('click', function (event) {
                        // Close Modal
                        $.fancybox.close();
                    },);
                    $('.modal-btn-ok', modalContainer).on('click', function(event){
                        // Get new link attributes
                        var linkText = $('[data-link="text"]', modalContainer).val();
                        var linkURL = $('[data-link="url"]', modalContainer).val();
                        // Assign new link attributes to target element
                        $target.html(linkText);
                        $target.attr('href', linkURL);

                        // Close Modal
                        $.fancybox.close();
                    });
                }
            }
        });
        return false;
    },

    imageEditor: function (event) {
        // Destroy the uploader
        if(ContentEditor.imageUploader){
            ContentEditor.imageUploader.slim('destroy');
            ContentEditor.imageUploader=null;
        }

        var $target = $(event.target),  // Current Image (target element)
            modalContainer = $('#imageeditor'),  // Modal Container
            targetImageSrc =  $target.attr('src'), // Currrent Image Src
            targetImageAlt =  $target.attr('alt'), // Currrent Image Alt
            targetImageWidth =  $target.width(), // Currrent Image Width
            targetImageHeight =  $target.height(), // Currrent Image Height
            targetLinkURL = ''; // Current Image Link

            if ($target.parent().is( 'a' )) {
                targetLinkURL = $target.parent('a').attr('href');
            }

        // Fill-in Modal Form with Image attributes
        $('[data-image="url"]', modalContainer).val(targetLinkURL);
        $('[data-image="alt"]', modalContainer).val(targetImageAlt);
        $('[data-image="width"]', modalContainer).val(targetImageWidth);
        $('[data-image="height"]', modalContainer).val(targetImageHeight);
        $('[data-image="src"]', modalContainer).attr('src', targetImageSrc);

        $.fancybox.open({
            src  : '#imageeditor',
            type : 'inline',
            opts : {
                afterClose: function(){
                    // Clear the modal form
                    $('[data-image="url"]', modalContainer).val('');
                    $('[data-image="alt"]', modalContainer).val('');
                    $('[data-image="width"]', modalContainer).val('');
                    $('[data-image="height"]', modalContainer).val('');
                    $('[data-image="src"]', modalContainer).attr('src', '');
                },
                onComplete : function() {
                    // Remove previous on-click event listeners
                    $('.modal-btn-cancel', modalContainer).off('click');
                    $('.modal-btn-ok', modalContainer).off('click');

                    // Init image uploader
                    ContentEditor.imageUploader = $('#modal-image-uploader').slim({
                        fetcher: 'server/fetch.php',
                        service: 'server/async.php',
                        push: true,
                        instantEdit: true,
                        didUpload: function(){
                            var $data = ContentEditor.imageUploader.slim('data')[0],
                            imageSrc = config.uploads + '/' + $data.server.file,
                            imageWidth = $data.output.width,
                            imageHeight = $data.output.height;

                            $('[data-image="width"]', modalContainer).val(imageWidth);
                            $('[data-image="height"]', modalContainer).val(imageHeight);
                            $('[data-image="src"]', modalContainer).attr('src', imageSrc);
                        }
                    });


                    $('.modal-btn-cancel', modalContainer).on('click', function (event) {
                        // Close Modal
                        $.fancybox.close();
                    });
                    $('.modal-btn-ok', modalContainer).on('click', function(event){
                        // Get new link attributes
                        var imageURL = $('[data-image="url"]', modalContainer).val(),
                            imageAlt = $('[data-image="alt"]', modalContainer).val(),
                            imageWidth = $('[data-image="width"]', modalContainer).val(),
                            imageHeight = $('[data-image="height"]', modalContainer).val(),
                            imageSrc = $('[data-image="src"]', modalContainer).attr('src');

                        // Assign new link attributes to target element
                        $target.attr('src', imageSrc); // Image Src
                        $target.attr('alt', imageAlt); // Image Alt
                        $target.attr('width', imageWidth); // Image Width
                        $target.attr('height', imageHeight); // Image Height

                        $target.unwrap('a'); // Unwrap image
                        if(imageURL){ //Wrap image with link if URL is present
                            $target.wrap('<a href="' + imageURL + '"></a>');
                        }

                        // Close Modal
                        $.fancybox.close();
                    });
                }
            }
        });
        return false;
    }


};

emitter.on('update_template', function () {
    // Init the content editor
    ContentEditor.init();
});

// Export ContentEditor object
module.exports = ContentEditor;


