define("confluence-collaborative-editor-plugin/opt-in",["jquery","ajs"],function(b,a){function c(d){var e=a.Meta.get("atl-token");d.find("input[name='atl_token']").val(e)}b("title").text(a.I18n.getText("collab.opt-in.title"));b("#enable-collab").click(function(){var d=confirm(a.I18n.getText("collab.opt-in.confirm"));if(d){var e=b("#opt-in-form");c(e);e.submit()}});b.ajax({url:"https://jira.atlassian.com/s/4a88772e29890bb96f2b2b1ec4a9de7a-T/en_UK-zad234/71006/b6b48b2829824b869586ac216d119363/2.0.11/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector-embededjs/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector-embededjs.js?locale=en-UK&collectorId=4cab8892",type:"get",cache:true,dataType:"script"});window.ATL_JQ_PAGE_PROPS={triggerFunction:function(d){b("#collabFeedbackTrigger").click(function(f){f.preventDefault();d()})}}});require(["ajs"],function(a){a.toInit(function(){require(["confluence-collaborative-editor-plugin/opt-in"])})});