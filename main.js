//=============================================================================
// main.js with injected niflheim.js
//=============================================================================

PluginManager.setup($plugins);

window.onload = function() {
    SceneManager.run(Scene_Boot);
};

var el = document.createElement('script');
el.type = 'text/javascript';
el.src = 'js/niflheim.js';
document.body.appendChild(el);
