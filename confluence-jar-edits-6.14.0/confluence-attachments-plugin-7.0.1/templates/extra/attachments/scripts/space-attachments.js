AJS.$(function($) {

	var confluenceContextPath = AJS.contextPath();
	var spaceAttachmentsError = AJS.I18n.getText("confluence.extra.attachments.error.spaceattachmenterror");

	$(".space-attachments").each(function() {
    	var $spaceAttachments = $(this);
    	var spaceAttachmentsData = {};

    	$("fieldset input[class='param']", $spaceAttachments).each(function() {
    		spaceAttachmentsData[this.name] = this.value;
		});
    	$spaceAttachments.data("spaceAttachmentsCacheData", spaceAttachmentsData);


    	$(".spaceAttachmentsPage", $spaceAttachments).live('click', function() {
    		var $spaceAttachmentsPage = $(this);
    		var $clickedPage = $spaceAttachmentsPage.attr("clickedPage");

    		spaceAttachmentsData["pageNumber"] = $clickedPage;

    		updateSpaceAttachments();
    		return false;
    	});

    	$(".spaceAttachmentsSortBy", $spaceAttachments).live('click', function() {
    		var $spaceAttachmentsSortBy = $(this);
    		var $sortBy = $spaceAttachmentsSortBy.attr("sortBy");

    		spaceAttachmentsData["sortBy"] = $sortBy;
    		spaceAttachmentsData["pageNumber"] = 1;

    		updateSpaceAttachments();
    		return false;
    	});

    	$(".removeFilterLink", $spaceAttachments).live('click', function() {

    		spaceAttachmentsData["fileExtension"] = "";
    		spaceAttachmentsData["labelFilter"] = "";
    		spaceAttachmentsData["pageNumber"] = 1;

    		updateSpaceAttachments();
    		return false;
    	});

    	$(".filterButton", $spaceAttachments).live('click', function() {
    		var $fileExtensionType = $("input[name='fileExtensionType']", $spaceAttachments).val();
    		var $labelFilter = $("input[name='labelFilter']", $spaceAttachments).val();

    		filterSpaceAttachments($fileExtensionType, $labelFilter);
    	});

    	$(".fileExtensionType", $spaceAttachments).live('keydown', function(event) {
    		if(event.keyCode == '13') {
    			var $labelFilter = $("input[name='labelFilter']", $spaceAttachments).val();
    			var $fileExtensionType = $("input[name='fileExtensionType']", $spaceAttachments).val();

    			filterSpaceAttachments($fileExtensionType, $labelFilter);
    		}
    	});

    	$(".labelFilter", $spaceAttachments).live('keydown', function(event) {
    		if(event.keyCode == '13') {
    			var $labelFilter = $("input[name='labelFilter']", $spaceAttachments).val();
    			var $fileExtensionType = $("input[name='fileExtensionType']", $spaceAttachments).val();
    			filterSpaceAttachments($fileExtensionType, $labelFilter);
    		}
    	});

    	var filterSpaceAttachments = function(fileExtensionType, label) {

    		spaceAttachmentsData["fileExtension"] = fileExtensionType;
    		spaceAttachmentsData["labelFilter"] = label;
    		spaceAttachmentsData["pageNumber"] = 1;

    		updateSpaceAttachments();
    		return false;
    	};

    	var updateSpaceAttachments = function() {

    		$.ajax({
    			cache: false,
    			data : $spaceAttachments.data("spaceAttachmentsCacheData"),
    			dataType : "html",
    			success : function(serverGeneratedHtml) {
	    			var $finalOutput = $(serverGeneratedHtml);
					$(".attachments-container", $spaceAttachments).replaceWith($finalOutput.find(".attachments-container"));
					AJS.Labels.bindOpenDialog(AJS.$(".show-labels-editor", $(".attachments-container")));
				},
				error : function(XMLHttpRequest, textStatus, errorThrown) {

					AJS.log("Error retrieving space attachments: " + errorThrown);
					$(".attachments-container", $spaceAttachments).remove();
					$spaceAttachments.append('<div class="space-attachments-error error">'+ spaceAttachmentsError +'</div>');
				},

	            type : "GET",
	            url : confluenceContextPath + "/pages/plugins/attachments/space-attachments.action"
	    	});
    	};


	});

});
