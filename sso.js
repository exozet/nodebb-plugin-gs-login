console.log("client js");

if (app.user.uid) {
  console.log("logged in!");
} else {
  
  console.log("not logged in!");
  var sessionId = Cookies.get('connect.sid');
  if (sessionId) {
      console.log(sessionID);
			$.ajax('/login', {
				type: 'POST',
				data: "username=session&password=session&remember=1&returnTo=" + document.URL,
				headers: {
					'x-csrf-token': config.csrf_token
				},
				success: function() {
					window.location.href = document.URL;
				}
			});

  }
}