const JOB_VALK = 12;

const SKILL_RUNEBURST = 161200;
const SKILL_RUNEBURST_R = 166200;


module.exports = function ValkFastRB(mod) {
	const {command} = mod;
	
	let gameId,
		model,
		job,
		enabled = false;

	let CANCEL_DELAY = 600;

	command.add('valkrb', {
		$default() { 
			enabled = !enabled;
        	command.message(`Valkyrie fast runeburst is now ${enabled ? "enabled" : "disabled"}.`);
    	},
    	delay(value) {
    		value = parseInt(value);
    		if (!isNaN(value)) {
    			CANCEL_DELAY = value;
    			command.message(`Runeburst delay cancel set to ${CANCEL_DELAY}.`);
    		}
    	}
	});

	mod.hook('S_LOGIN', '14', { order : Infinity }, event => {
	    gameId = mod.game.me.gameId;
	    model = mod.game.me.templateId;
	    job = (model - 10101) % 100;
	    mod.settings.enabled = [JOB_VALK].includes(job);
	});

	mod.hook('S_ACTION_STAGE', 9, {order: -1000000, filter: {fake: null}}, event => {
		if (!enabled || event.gameId !== gameId) return;

	    if (event.skill.id == SKILL_RUNEBURST || event.skill.id == SKILL_RUNEBURST + 30) {
	    	event.skill.id = SKILL_RUNEBURST
	    } else if (event.skill.id == SKILL_RUNEBURST_R || event.skill.id == SKILL_RUNEBURST_R + 30) {
	    	event.skill.id = SKILL_RUNEBURST_R;
	    }

	    if ([SKILL_RUNEBURST, SKILL_RUNEBURST_R].includes(event.skill.id)) {
	    	mod.setTimeout(() => {
	    		mod.toClient('S_ACTION_END', 5, {
					gameId,
					loc: { x: event.loc.x, y: event.loc.y, z: event.loc.z },
					w: event.w,
					templateId: model,
					skill: event.skill.id,
					type: 12394123,
					id: event.id,
				});
	    	}, CANCEL_DELAY);
	    }
	});

	mod.hook('S_ACTION_END', 5, {order: -1000000, filter: {fake: null}}, event => {
	    if (!enabled || event.gameId !== gameId) return;

	   	if (event.skill.id == SKILL_RUNEBURST || event.skill.id == SKILL_RUNEBURST + 30 || event.skill.id == SKILL_RUNEBURST_R || event.skill.id == SKILL_RUNEBURST_R + 30) {
	   		if (event.type == 12394123) {
	   			event.type = 4;
	   			return true;
	   		} else {
	   			return false;
	   		}
	   	}
	});
}
