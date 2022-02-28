import * as core from "@actions/core";
import { exec } from "@actions/exec";
import * as github from "@actions/github";

async function main() {
	try {
		const context = github.context;
		core.info(`Building and testing solution (ref: ${context.ref})...`);
		core.info("(1/5) Install Gulp");
		await exec(`yarn add global gulp --network-timeout 1000000`);
		core.info("(2/5) Install");
		await exec(`yarn install --freeze-lockfile`);
		core.info("(3/5) Build");
		await exec(`yarn gulp bundle --ship`);
		core.info("(4/5) Test");
		await exec(`yarn test`);
		core.info("(5/5) Package");
		await exec(`yarn gulp package-solution --ship`);
		core.info(`✅ complete`);
	} catch (err) {
		core.error("❌ Failed");
		core.setFailed(err.message);
	}
}

main();
