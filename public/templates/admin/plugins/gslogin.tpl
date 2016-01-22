<div class="row">
    <div class="col-lg-9">
        <form class="form" id="gamesparks-settings">
            <div class="panel panel-default">
                <div class="panel-heading">Gamesparks Login</div>
                <div class="panel-body">
                    <div class="row">
                        <div class="col-lg-6">
                            <div class="form-group">
                                <select class="form-control" name="stage" id="stage" data-key="strings.stage">
                                    <option value="preview">Preview</option>
                                    <option value="stage">Stage</option>
                                    <option value="live">Live</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-lg-12">
                            <div class="form-group">
                                <label for="apiKey">
                                    <input type="text" name="apiKey" id="apiKey" data-key="strings.apiKey" />
                                    Gamesparks API Key
                                </label>
                            </div>
                            <div class="form-group">
                                <label for="serverSecret">
                                    <input type="text" name="serverSecret" id="serverSecret" data-key="strings.serverSecret" />
                                    Gamesparks Server Secret (click on top right lock icon @ GS configurator)
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
    <div class="col-lg-3">
        <div class="panel panel-default">
            <div class="panel-heading">Action Panel</div>
            <div class="panel-body">
                <button class="btn btn-primary" id="save">Save Settings</button>
            </div>
        </div>
    </div>
</div>

<script>
require(['settings'], function(Settings) {

    var wrapper = $('#gamesparks-settings');

    var save = function (event) {
        event.preventDefault();
        Settings.persist('gs-login', wrapper, function() {
            socket.emit('admin.settings.syncGsLogin');
        });

        app.alert({
            type: 'success',
            alert_id: 'gs-login.saved',
            title: 'Reload Required',
            message: 'Please reload your NodeBB to have your changes take effect',
            clickfn: function() {
                socket.emit('admin.reload');
            }
        });
    };

    Settings.sync('gs-login', wrapper);
    $('#save').on('click', save);
});
</script>