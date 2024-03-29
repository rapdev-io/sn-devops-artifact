const core = require('@actions/core');
const axios = require('axios');

(async function main() {
    const instanceName = core.getInput('instance-name', { required: true });
    const toolId = core.getInput('tool-id', { required: true });
    const username = core.getInput('devops-integration-user-name', { required: true });
    const pass = core.getInput('devops-integration-user-pass', { required: true });
    const defaultHeaders = { 'Content-Type': 'application/json' };


    let artifacts;
    if (!!core.getInput('artifacts'), { required: true }) {
        try {
            artifacts = JSON.parse(core.getInput('artifacts'), { required: true });
        } catch (e) {
            core.setFailed(`failed to parse artifacts JSON: ${e}`);
            return;
        }
    }

    let githubContext = core.getInput('context-github', { required: true });

    try {
        githubContext = JSON.parse(githubContext);
    } catch (e) {
        core.setFailed(`exception parsing github context ${e}`);
    }
    const sncArtifactURL = `https://${username}:${pass}@${instanceName}.service-now.com/api/sn_devops/devops/artifact/registration?toolId=${toolId}&orchestrationToolId=${toolId}`;
    let artifactBody;
    let response;
    let stageName = core.getInput('stage-name', { required: false });
    try {
        artifactBody = {
            'artifacts': artifacts,
            'pipelineName': `${githubContext.repository}/${githubContext.workflow}`,
            'stageName': `${githubContext.job}`,
            'taskExecutionNumber': `${githubContext.run_number}`
        };

        if(stageName) {
            artifactBody.stageName = stageName;
        }

        console.log("artifact body: " + JSON.stringify(artifactBody));

        let artifactConfig = { headers: defaultHeaders };
        response = await axios.post(sncArtifactURL, artifactBody, artifactConfig);
        console.log("ServiceNow Status: " + response.status + "; Response: " + JSON.stringify(response.data));
    }
    catch (e) {
        artifactBody = JSON.stringify(artifactBody);
        core.setFailed(`failed POSTing artifact registration: ${e}\n artifactBody is ${artifactBody}`);
    }

})();