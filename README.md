# nodebb-plugin-sso-session
A single sign on (SSO) plugin for nodeBB that logs the user in based on gamesparks validation.

## Installation
Run `npm install git://github.com/exozet/nodebb-plugin-gs-login#1.0.0` in your NodeBB installation directory.
Reload your board and browse to the admin-panel -> Plugins -> Gamesparks-Login and fill in the required settings.

### Profile deletion by User
Can be prevented with adding the following snippet to the custom header settings (have to be enabled too) in admin panel.

```
<script>
    /**
     * JS snippet to prevent profile deletion by user.
     */
    document.addEventListener('DOMContentLoaded', function () {
        var profileDeleteBtn = document.getElementById('deleteAccountBtn');
        if(profileDeleteBtn != null) {
            profileDeleteBtn.parentNode.removeChild(profileDeleteBtn);
        }
    });
</script>
```