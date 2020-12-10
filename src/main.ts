import * as core from "@actions/core";
import { exec } from "@actions/exec";
import * as github from "@actions/github";

async function main() {
	try {
		const context = github.context;
		core.info(`Building and testing solution (ref: ${context.ref})...`);
		core.info("(1/4) Install");
		await exec(`yarn install --freeze-lockfile --network-timeout 1000000`);
		core.info("(2/4) Build");
		await exec(`yarn gulp bundle --ship`);
		core.info("(3/4) Test");
		await exec(`yarn test`);
		core.info("(4/4) Package");
		await exec(`yarn gulp package-solution --ship`);
		core.info(`✅ complete`);
	} catch (err) {
		core.error("❌ Failed");
		core.setFailed(err.message);
	}
}

main();
