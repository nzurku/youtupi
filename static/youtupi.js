var server = window.location.protocol + "//" + window.location.host;
function loadPlayList(entries){
	$("#playlist-list").empty();
	for (var i = 0; i < entries.length; i++) {
		var video = entries[i];
		var itemval = $('<li><a href="#"><img src="'+ video.thumbnail + '" /><h3>' + video.title + '</h3><p>'+video.description + '</p></a></li>');
		itemval.bind('click', {video: video}, function(event) {
			var url = server + "/control/play";
			var data = $.toJSON(event.data.video);
			$.post(url, data, loadPlayList, "json");
		});
		$("#playlist-list").append(itemval);
	}
	$("#playlist-list").listview("refresh");
}
function playerAction(paction){
	$.getJSON(
		server + "/control/"+paction, loadPlayList
	);
}
function loadVideo(video){
	tabPlaylist();
	$("#spinner").show();
	video.type = "youtube";
	video.format = $("#quality").val();
	var url = server + "/playlist";
	var data = $.toJSON(video);
	$.post(url, data, function(entries){
		$("#spinner").hide();
		loadPlayList(entries);
	}, "json");
}
function tabPlaylist(){
    $(".link-playlist").first().trigger('click');
}

$(document).delegate("#youtube", "pageinit", function() {
	$("#search-basic").bind("change", function(event, ui) {
		$('#results').empty();
		$("#results").listview("refresh");
		var query = $("#search-basic").val();
		if(query != ''){
			var url;
			if(query.substring(0, 2) == "u:"){
				query = query.substring(2, query.length);
				url = 'https://gdata.youtube.com/feeds/api/users/'+query+'/uploads?v=2&alt=jsonc';
			}else if(query.substring(0, 2) == "f:"){
				query = query.substring(2, query.length);
				url = 'http://gdata.youtube.com/feeds/api/users/'+query+'/favorites?v=2&alt=jsonc';
			}else{
				url = 'http://gdata.youtube.com/feeds/api/videos?vq='+query+'&max-results='+$('#slider').val()+'&v=2&alt=jsonc&orderby=relevance&sortorder=descending';
			}
			$.getJSON(url, function(response){
				var entries = response.data.items || [];
				for (var i = 0; i < entries.length; i++) {
					var entry = entries[i];
					if(typeof entry.video != 'undefined'){
						entry = entry.video;
					}
					var video = {}
					video.id = entry.id;
					video.description = entry.description;
					video.title = entry.title;
					video.duration = entry.duration;
					video.thumbnail = entry.thumbnail.hqDefault;
					var itemval = $('<li><a href="#"><img src="'+ video.thumbnail + '" /><h3>' + video.title + ' (' + Math.round(video.duration/60) + ':' + video.duration % 60 + ')' + '</h3><p>'+video.description + '</p></a></li>');
					itemval.bind('click', {video: video}, function(event) {
						loadVideo(event.data.video);
					});
					$("#results").append(itemval);
				}
				$("#results").listview("refresh");
			});
		}
	});
});

$(document).delegate("#one", "pageinit", function() {
	window.setInterval(function(){
		$.getJSON(
			server + "/playlist", loadPlayList
		);
	}, 3000);
});
