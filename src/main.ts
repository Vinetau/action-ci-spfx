import * as artifact from "@actions/artifact";
import * as core from "@actions/core";
import { exec } from "@actions/exec";
import * as github from "@actions/github";

async function main() {
	try {
		let solutionName: string = core.getInput("SOLUTION_NAME", { required: false });
		const context = github.context;
		const repo = context.repo.repo;
		core.info(`🧪 ${context.ref}`);
		core.info("Building and testing solution...");
		core.info("(1/4) Install");
		await exec(`yarn install --freeze-lockfile`);
		core.info("(2/4) Build");
		await exec(`yarn gulp bundle --ship`);
		core.info("(3/4) Test");
		await exec(`yarn test`);
		core.info("(4/4) Package");
		await exec(`yarn gulp package-solution --ship`);
		// If no solution name is provided we assume that the solution filename is repo_name.sppkg
		solutionName = solutionName ? solutionName : `${repo}.sppkg`;
		createArtifact([`sharepoint\\solution\\${solutionName}`], repo);

	} catch (err) {
		core.error("❌ Failed");
		core.setFailed(err.message);
	}
}

async function createArtifact(files: string[], artifactName: string) {
	core.info(`Creating artifact ${artifactName}...`);
	const artifactClient = artifact.create();
	try {
		const uploadResult = await artifactClient.uploadArtifact(artifactName, files, ".");
		core.info(`✅ complete`);
	} catch (error) {
		core.error("❌ Could not create artifact");
		core.setFailed(error.message);

	}
}

async function deployToOctopus(projectName: string, version: string, repo: string, solutionPath: string, deployTo: string, octopusUrl: string, octopusApiKey: string) {
	try {
		core.info("Installing octopus cli...");
		await exec(`dotnet tool install octopus.dotnet.cli --tool-path .`);
		core.info("Packing Solution...");
		await exec(`pwd`);
		await exec(`.\\dotnet-octo.exe pack --id=${repo} --outFolder=output --basePath=${solutionPath} --version=${version}`);
		core.info("Pushing to Octopus...");
		await exec(`.\\dotnet-octo push --package=output\\${repo}.${version}.nupkg --server=${octopusUrl} --apiKey=${octopusApiKey}`);
		core.info("Creating Release...");
		const deployToString = deployTo ? `--deployTo=${deployTo}` : "";
		await exec(`.\\dotnet-octo create-release --project=${projectName} --version=${version} --server=${octopusUrl} --apiKey=${octopusApiKey} ${deployToString}`);
		core.info("✅ complete");
		sendTeamsNotification(projectName, `✔ Version ${version} Deployed to Octopus`);
	} catch (err) {
		core.error("❌ Failed to deploy");
		core.setFailed(err.message);
	}
}

/**
 * Sends a MS Teams notification
 * @param title
 * @param body
 */
async function sendTeamsNotification(title: string, body: string) {
	const webhookUrl = "https://outlook.office.com/webhook/beb7ab67-f145-4f1b-b78e-a87ef32d13c5@0dfbb122-0ae4-46cf-95f5-950fdedb4a38/IncomingWebhook/2c8fe1f60f0044ca92c62582482070f7/ec6f0c35-3f41-43af-b946-4c9fc5215efe";
	const data = `"{ '@context': 'http://schema.org/extensions', '@type': 'MessageCard', 'title': '${title}', 'text': '${body}' }"`;
	core.info("Sending Teams notification...");
	// await exec(`curl --url "${webhookUrl}" -d ${data}`);
}

async function executeCommand(command: string): Promise<any> {
	let output = "";
	const options: any = {};
	options.listeners = {
		stdout: (data: Buffer) => {
			output += data.toString();
		},
	};
	try {
		await exec(command.trim(), [], options);
		return output;
	} catch (err) {
		throw new Error(err);
	}
}

main();
