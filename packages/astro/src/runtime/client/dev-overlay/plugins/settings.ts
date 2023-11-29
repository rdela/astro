import type { DevOverlayPlugin } from '../../../../@types/astro.js';
import { settings, type Settings } from '../settings.js';
import { createWindowWithTransition, waitForTransition } from './utils/window.js';

interface SettingRow {
	name: string;
	description: string;
	input: 'checkbox' | 'text' | 'number' | 'select';
	settingKey: keyof Settings;
	changeEvent: (evt: Event) => void;
}

const settingsRows = [
	{
		name: 'Disable notifications',
		description: 'Notification bubbles will not be shown when this is enabled.',
		input: 'checkbox',
		settingKey: 'disablePluginNotification',
		changeEvent: (evt: Event) => {
			if (evt.currentTarget instanceof HTMLInputElement) {
				settings.updateSetting('disablePluginNotification', evt.currentTarget.checked);
				const action = evt.currentTarget.checked ? 'enabled' : 'disabled';
				settings.log(`Plugin notification badges ${action}`);
			}
		},
	},
	{
		name: 'Verbose logging',
		description: 'Logs dev overlay events in the browser console.',
		input: 'checkbox',
		settingKey: 'verbose',
		changeEvent: (evt: Event) => {
			if (evt.currentTarget instanceof HTMLInputElement) {
				settings.updateSetting('verbose', evt.currentTarget.checked);
				const action = evt.currentTarget.checked ? 'enabled' : 'disabled';
				settings.log(`Verbose logging ${action}`);
			}
		},
	},
] satisfies SettingRow[];

export default {
	id: 'astro:settings',
	name: 'Overlay settings',
	icon: 'gear',
	init(canvas) {
		createSettingsWindow();

		document.addEventListener('astro:after-swap', createSettingsWindow);

		function createSettingsWindow() {
			const window = createWindowWithTransition(
				`<style>
					header {
						display: flex;
					}

					h2, h3 {
						margin-top: 0;
					}

					.setting-row {
						display: flex;
						justify-content: space-between;
						align-items: center;
					}

					h3 {
						font-size: 16px;
						font-weight: 400;
						color: white;
						margin-bottom: 0;
					}

					label {
						font-size: 15px;
						line-height: 1.5rem;
					}

					h1 {
						display: flex;
						align-items: center;
						gap: 8px;
						font-weight: 600;
						color: #fff;
						margin: 0;
						font-size: 22px;
					}

					astro-dev-overlay-icon {
						width: 1em;
   					height: 1em;
    				display: block;
					}
				</style>
				<header>
					<h1><astro-dev-overlay-icon icon="gear"></astro-dev-overlay-icon> Settings</h1>
				</header>

				<hr />

				<h2>General</h2>
				`,
				settingsRows.flatMap((setting) => [
					getElementForSettingAsString(setting),
					document.createElement('hr'),
				])
			);
			canvas.append(window);

			function getElementForSettingAsString(setting: SettingRow) {
				const label = document.createElement('label');
				label.classList.add('setting-row');
				const section = document.createElement('section');
				section.innerHTML = `<h3>${setting.name}</h3>${setting.description}`;
				label.append(section);

				switch (setting.input) {
					case 'checkbox': {
						const astroToggle = document.createElement('astro-dev-overlay-toggle');
						astroToggle.input.addEventListener('change', setting.changeEvent);
						astroToggle.input.checked = settings.config[setting.settingKey];
						label.append(astroToggle);
					}
				}

				return label;
			}
		}
	},
	async beforeTogglingOff(canvas) {
		return await waitForTransition(canvas);
	},
} satisfies DevOverlayPlugin;
