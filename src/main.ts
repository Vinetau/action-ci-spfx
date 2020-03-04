import * as artifact from "@actions/artifact";
import * as core from "@actions/core";
import { exec } from "@actions/exec";
import * as github from "@actions/github";

async function main() {
	try {
		const context = github.context;
		core.info(`Building and testing solution (ref: ${context.ref})...`);
		core.info("(1/4) Install");
		await exec(`yarn install --freeze-lockfile`);
		core.info("(2/4) Build");
		await exec(`yarn gulp bundle --ship`);
		core.info("(3/4) Test");
		await exec(`yarn test`);
		core.info("(4/4) Package");
		await exec(`yarn gulp package-solution --ship`);
		// if (context.ref === "refs/heads/master") {
		// 	// If no solution name is provided we assume that the solution filename is repo_name.sppkg
		// 	solutionName = solutionName ? solutionName : `${repo}.sppkg`;
		// 	createArtifact([`sharepoint\\solution\\${solutionName}`], repo);
		// }
		core.info(`✅ complete`);
	} catch (err) {
		core.error("❌ Failed");
		core.setFailed(err.message);
	}
}

async function createArtifact(files: string[], artifactName: string) {
	core.info(`📦 Creating artifact ${artifactName}...`);
	const artifactClient = artifact.create();
	try {
		const response = await artifactClient.uploadArtifact(artifactName, files, ".");
		core.info(`Artifact ${response.artifactName} (size: ${response.size}) uploaded`);
		core.info(`✅ complete`);
	} catch (error) {
		core.error("❌ Could not create artifact");
		core.setFailed(error.message);

	}
}

main();
