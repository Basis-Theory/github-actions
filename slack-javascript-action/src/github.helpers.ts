const github = require("@actions/github");
const core = require("@actions/core"); // For managing action inputs/outputs
const fs = require('fs');
const path = require('path');

// Function to read files and log their contents
export function readAndLogFiles(files?: string[]) {
    // List of file paths to read

    // Iterate over the list of file paths
    if (!files) {
        return;
    }

    files.filter(filePath => filePath?.trim()).forEach((filePath) => {
        // Ensure the file exists before trying to read it
        if (fs.existsSync(filePath)) {
            // Read the file contents
            fs.readFile(filePath, 'utf8', (err: any, data: any) => {
                if (err) {
                    console.error(`Error reading file ${filePath}:`, err);
                } else {
                    console.log(`Contents of ${filePath}:`);
                    console.log(data);
                    console.log('-----------------------------------');
                }
            });
        } else {
            console.log(`File ${filePath} does not exist.`);
        }
    });
}

export async function getJobStatuses() {
    const token = process.env.GITHUB_TOKEN; // Automatically passed to your action
    console.log("token exists", token?.length);
    if (!token) {
        throw new Error("GITHUB_TOKEN not found in environment");
    }
    const octokit = github.getOctokit(token);

    const { owner, repo } = github.context.repo;
    const runId = github.context.runId; // The workflow run ID

    try {
        // Fetch the jobs for the specific workflow run
        const { data: jobs } = await octokit.actions.listJobsForWorkflowRun({
            owner,
            repo,
            run_id: runId,
        });

        // Loop through jobs and print job statuses
        jobs.jobs.forEach((job: any) => {
            console.log(
                `Job: ${job.name}, Status: ${job.status}, Conclusion: ${job.conclusion}`
            );
        });

        // Check if any job was canceled
        const cancelledJobs = jobs.jobs.filter(
            (job: any) => job.status === "cancelled"
        );
        if (cancelledJobs.length > 0) {
            console.log("There were canceled jobs:", cancelledJobs);
        } else {
            console.log("No jobs were canceled.");
        }
    } catch (error) {
        console.error("Error fetching job statuses:", error);
    }
}
