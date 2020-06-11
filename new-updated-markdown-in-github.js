const crypto = require("crypto");
const { extname } = require("path");
// TODO: configure retries and throttling
// See https://octokit.github.io/rest.js/#automatic-retries
const { Octokit } = require("@octokit/rest");
const github = require("https://github.com/PipedreamHQ/pipedream/components/github/github.app.js");
const uniq = require("lodash.uniq");

module.exports = {
  name: "New or Updated Markdown Files in Git commit",
  version: "0.0.2",
  props: {
    db: "$.service.db",
    http: "$.interface.http",
    github,
    repoFullName: { propDefinition: [github, "repoFullName"] },
  },
  methods: {
    generateSecret() {
      return "" + Math.random();
    },
    isMarkdown(file) {
      return extname(file) === `.md`;
    },
    async getFileContents(owner, repo, path, ref) {
      const octokit = new Octokit({
        auth: this.github.$auth.oauth_access_token,
      });

      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path,
        ref,
      });

      // content is base64-encoded, so we decode to a UTF-8 string
      return Buffer.from(data.content, "base64").toString("utf8");
    },
  },
  hooks: {
    async activate() {
      const secret = this.generateSecret();
      const { id } = await this.github.createHook({
        repoFullName: this.repoFullName,
        endpoint: this.http.endpoint,
        events: ["push"],
        secret,
      });
      this.db.set("hookId", id);
      this.db.set("secret", secret);
    },
    async deactivate() {
      await this.github.deleteHook({
        repoFullName: this.repoFullName,
        hookId: this.db.get("hookId"),
      });
    },
  },
  async run(event) {
    this.http.respond({
      status: 200,
    });
    const { body, headers } = event;

    if (headers["X-Hub-Signature"]) {
      const algo = "sha1";
      const hmac = crypto.createHmac(algo, this.db.get("secret"));
      hmac.update(body, "utf-8");
      if (headers["X-Hub-Signature"] !== `${algo}=${hmac.digest("hex")}`) {
        throw new Error("signature mismatch");
      }
    }

    if ("zen" in body) {
      console.log("Zen event to confirm subscription, nothing to emit");
      return;
    }

    // Parses the incoming push for new commits
    // Returns any new, updated, or removed posts

    const { ref, commits } = body;
    const { default_branch, name, owner } = body.repository;

    // Ensure push is tied to default repo branch, else exit early
    if (ref !== `refs/heads/${default_branch}`) {
      console.log(`Push not for default branch of ${default_branch}`);
      return;
    }

    if (!commits || !commits.length) {
      console.log("No commits in this push");
      return;
    }

    let addedPosts = [];
    let modifiedPosts = [];

    for (const commit of commits) {
      // Files added or modified in this Git commit
      const { added, modified } = commit;

      // We just care about Markdown files
      addedPosts = addedPosts.concat(added.filter(this.isMarkdown));
      modifiedPosts = modifiedPosts.concat(modified.filter(this.isMarkdown));
    }

    // There are a number of conditions where the same file may be included
    // in multiple commits. I might edit the same file multiple times, or
    // work on a change in a new branch, then merge that change to master,
    // which yields two commits. We dedupe any added or modified files to
    // ensure the same file isn't included twice in either group.
    addedPosts = uniq(addedPosts, "path");
    modifiedPosts = uniq(modifiedPosts, "path");

    if (!addedPosts.length && !modifiedPosts.length) {
      console.log("No Markdown files added or updated in this commit");
      return;
    }

    // Now, get the contents of each file
    const addedFileContents = [];
    for (const path of addedPosts) {
      addedFileContents.push({
        path,
        contents: await this.getFileContents(owner.name, name, path, ref),
      });
    }

    const modifiedFileContents = [];
    for (const path of modifiedPosts) {
      modifiedFileContents.push({
        path,
        contents: await this.getFileContents(owner.name, name, path, ref),
      });
    }

    this.$emit(
      { addedFileContents, modifiedFileContents },
      {
        summary: `${addedFileContents.length} added, ${modifiedFileContents.length} updated`,
      }
    );
  },
};
