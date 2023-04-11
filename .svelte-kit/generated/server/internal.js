
import root from '../root.svelte';
import { set_building } from '__sveltekit/environment';
import { set_assets } from '__sveltekit/paths';
import { set_private_env, set_public_env } from '../../../node_modules/@sveltejs/kit/src/runtime/shared-server.js';

export const options = {
	app_template_contains_nonce: false,
	csp: {"mode":"auto","directives":{"upgrade-insecure-requests":false,"block-all-mixed-content":false},"reportOnly":{"upgrade-insecure-requests":false,"block-all-mixed-content":false}},
	csrf_check_origin: true,
	embedded: false,
	env_public_prefix: 'PUBLIC_',
	hooks: null, // added lazily, via `get_hooks`
	preload_strategy: "modulepreload",
	root,
	service_worker: false,
	templates: {
		app: ({ head, body, assets, nonce, env }) => "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\" />\n    <link rel=\"icon\" href=\"" + assets + "/favicon.png\" />\n    <meta name=\"viewport\" content=\"width=device-width\" />\n    <style>\n      :root {\n        --color-background: rgb(230, 230, 230);\n        --color-primary: rgb(26, 26, 26);\n        --color-secondary: rgb(74, 74, 74);\n        --nav-background: rgba(230, 230, 230, 0.8);\n        --main-content-padding: 2rem;\n        --section-margin: 6rem;\n        --hero-margin: 12rem;\n        --text-xl: 13rem;\n        --text-lg: 4rem;\n        --text-md: 3rem;\n        --text-sm: 1.6rem;\n      }\n\n      @media (prefers-color-scheme: dark) {\n        :root {\n          --color-background: rgb(26, 26, 26);\n          --color-primary: rgb(230, 230, 230);\n          --color-secondary: rgb(187, 187, 187);\n          --nav-background: rgba(26, 26, 26, 0.8);\n        }\n\n        html {\n          color-scheme: dark;\n        }\n      }\n\n      html {\n        font-size: 10px;\n        background: var(--color-background);\n      }\n\n      html,\n      body {\n        padding: 0;\n        margin: 0;\n        font-family: Helvetica Neue, Helvetica, sans-serif;\n      }\n\n      body {\n        display: block;\n        text-transform: uppercase;\n        font-weight: bold;\n        line-height: 1;\n        color: var(--color-primary);\n        font-size: var(--text-sm);\n      }\n\n      @media (max-width: 1200px) {\n        :root {\n          --hero-margin: 10rem;\n          --text-xl: 9rem;\n          --text-lg: 4rem;\n          --text-md: 3rem;\n          --text-sm: 1.6rem;\n        }\n      }\n\n      @media (max-width: 840px) {\n        :root {\n          --hero-margin: 8rem;\n          --section-margin: 4rem;\n          --text-xl: 7rem;\n          --text-lg: 3rem;\n          --text-md: 2.7rem;\n          --text-sm: 1.6rem;\n        }\n      }\n\n      @media (max-width: 560px) {\n        :root {\n          --hero-margin: 6rem;\n          --main-content-padding: 1rem;\n          --section-margin: 3rem;\n          --text-xl: 5rem;\n          --text-lg: 2.5rem;\n          --text-md: 2.5rem;\n          --text-sm: 1.2rem;\n        }\n      }\n    </style>\n    " + head + "\n  </head>\n  <body data-sveltekit-preload-data=\"hover\">\n    <div style=\"display: contents\">" + body + "</div>\n  </body>\n</html>\n",
		error: ({ status, message }) => "<!DOCTYPE html>\n<html lang=\"en\">\n\t<head>\n\t\t<meta charset=\"utf-8\" />\n\t\t<title>" + message + "</title>\n\n\t\t<style>\n\t\t\tbody {\n\t\t\t\t--bg: white;\n\t\t\t\t--fg: #222;\n\t\t\t\t--divider: #ccc;\n\t\t\t\tbackground: var(--bg);\n\t\t\t\tcolor: var(--fg);\n\t\t\t\tfont-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,\n\t\t\t\t\tUbuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;\n\t\t\t\tdisplay: flex;\n\t\t\t\talign-items: center;\n\t\t\t\tjustify-content: center;\n\t\t\t\theight: 100vh;\n\t\t\t}\n\n\t\t\t.error {\n\t\t\t\tdisplay: flex;\n\t\t\t\talign-items: center;\n\t\t\t\tmax-width: 32rem;\n\t\t\t\tmargin: 0 1rem;\n\t\t\t}\n\n\t\t\t.status {\n\t\t\t\tfont-weight: 200;\n\t\t\t\tfont-size: 3rem;\n\t\t\t\tline-height: 1;\n\t\t\t\tposition: relative;\n\t\t\t\ttop: -0.05rem;\n\t\t\t}\n\n\t\t\t.message {\n\t\t\t\tborder-left: 1px solid var(--divider);\n\t\t\t\tpadding: 0 0 0 1rem;\n\t\t\t\tmargin: 0 0 0 1rem;\n\t\t\t\tmin-height: 2.5rem;\n\t\t\t\tdisplay: flex;\n\t\t\t\talign-items: center;\n\t\t\t}\n\n\t\t\t.message h1 {\n\t\t\t\tfont-weight: 400;\n\t\t\t\tfont-size: 1em;\n\t\t\t\tmargin: 0;\n\t\t\t}\n\n\t\t\t@media (prefers-color-scheme: dark) {\n\t\t\t\tbody {\n\t\t\t\t\t--bg: #222;\n\t\t\t\t\t--fg: #ddd;\n\t\t\t\t\t--divider: #666;\n\t\t\t\t}\n\t\t\t}\n\t\t</style>\n\t</head>\n\t<body>\n\t\t<div class=\"error\">\n\t\t\t<span class=\"status\">" + status + "</span>\n\t\t\t<div class=\"message\">\n\t\t\t\t<h1>" + message + "</h1>\n\t\t\t</div>\n\t\t</div>\n\t</body>\n</html>\n"
	},
	version_hash: "4idzu8"
};

export function get_hooks() {
	return {};
}

export { set_assets, set_building, set_private_env, set_public_env };
