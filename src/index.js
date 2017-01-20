'use strict'

const fs = require('fs');
const inquirer = require('inquirer');
const exec = require('child_process').exec;

// local directory where selectable setting files are stored
const LOCAL_SETTINGS_DIRECTORY = 'src/settings';
// file where current rocket league settings are stored
const ROCKET_LEAGUE_SETTINGS_FILE = process.env[
	(process.platform == 'win32')
		? 'USERPROFILE' 
		: 'HOME'
] + '\\Documents\\My Games\\Rocket League\\TAGame\\Config\\TASystemSettings.ini';

const MENU = {
	'-- Launch game': launchGame,
	// adds user's current settings to the list of available settings
	'-- Backup current settings': () => {
		inquirer.prompt([{
			message: 'Backup name:',
			name: 'name',
			type: 'string'
		}]).then((backup) => {
			copyFile(ROCKET_LEAGUE_SETTINGS_FILE, `${LOCAL_SETTINGS_DIRECTORY}/${backup.name}.ini`)
				.then(showMenu());
		});
	},
	'-- Quit': () => {
		process.exit(0);
	}
}

function copyFile (source, destination) {
	console.log(source, destination)

	return new Promise((resolve, reject) => {
		let strm = fs
			.createReadStream(source)
			.pipe(fs.createWriteStream(destination));

		strm.on('finish', function(){
			resolve();
		});
	})
}

function launchGame () {
	// works on windows 10, not sure if it works on other OS
	// probable there is a smarter way of doing this
	exec('start steam://rungameid/252950');
}

function launchGameWithSettings (settingsFile) {
	copyFile(`${LOCAL_SETTINGS_DIRECTORY}/${settingsFile}`, ROCKET_LEAGUE_SETTINGS_FILE)
		.then(launchGame());
}

function showMenu () {
	// get list of settings in local directory
	fs.readdir(LOCAL_SETTINGS_DIRECTORY, (err, settings) => {
		// default to empty list
		settings = settings || [];
		// add menu options to list
		settings = settings.concat(Object.keys(MENU));

		inquirer.prompt([{
			message: 'Choose which settings to run:',
			name: 'selected',
			type: 'list',
			choices: settings
		}]).then((options) => {
			// if the chose option is a menu option
			if (MENU[options.selected]) {
				// then execute the menu option
				MENU[options.selected]();
			} else {
				// otherwise launch game with selected settings
				launchGameWithSettings(options.selected);
			}
		});
	});
};

showMenu();