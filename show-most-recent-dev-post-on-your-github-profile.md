---
title: Show your most recent DEV post on your Github profile with Pipedream
published: false
tags: github, pipedream, meta, tutorial
---

Github just launched [READMEs for your Github profile](https://dev.to/natterstefan/how-to-add-a-readme-to-your-github-profile-2bo9). This is powerful and cool. Since you can add any [Markdown](https://www.markdownguide.org/) to a `README`, you can now add images, links, and all sorts of other content to your profile. Check out [Monica Powell's profile](https://github.com/M0nica), for example:

<img src="https://res.cloudinary.com/dkbxegavp/image/upload/v1594488579/dev.to%20posts/Screen_Shot_2020-07-11_at_10.29.00_AM_f3ji3s.png" alt="Monica Powell Github profile" />

What if you could take this a step further, and **update your profile _automatically_** in response to specific events? For example, what if you could always display your most recent tweet on your profile? What if you could list the Spotify track you're listening to _right now_?

Here, I'm going to show you how to display a link your newest DEV post on your profile:

<img src="https://res.cloudinary.com/dkbxegavp/image/upload/v1594444679/dev.to%20posts/Screen_Shot_2020-07-10_at_10.17.39_PM_rvedv0.png" alt="DEV post on profile" width="600px"/>

**Each time you publish a new post, [this Pipedream workflow](https://pipedream.com/@dylan/update-github-profile-with-my-most-recent-dev-post-p_YyCV6y/edit) will automatically update the link on that `README`**. [Pipedream](https://pipedream.com) is an integration platform for developers, and it's great for building serverless, event-driven workflows like this. Pipedream workflows are written using [pre-built actions](https://docs.pipedream.com/workflows/steps/actions/#using-existing-actions) and [custom Node.js code](https://docs.pipedream.com/workflows/steps/code/), each of which can connect to hundreds of API integrations. Workflows run [for free](https://docs.pipedream.com/pricing/).

Let's get started!

## **How this works**

First, add a `README` to your Github profile. [Stefan Natter](https://dev.to/natterstefan) published a great article on how to set that up:

{% link https://dev.to/natterstefan/how-to-add-a-readme-to-your-github-profile-2bo9 %}

Pick a place in that `README` where you'd like to display your most recent DEV posts. In [my `README`](https://github.com/dylburger/dylburger), I've included this Markdown:

```markdown
## DEV blog

I blog on [DEV](http://dev.to/). Check out my most recent post:

<!-- dev -->
<!-- devend -->
```

Notice the comments: `<!-- dev -->` and `<!-- devend -->`. **This is where the link to your newest DEV post will be added**. Put these comments wherever you'd like the link to live, and push that to your profile `README`.

Visit [https://pipedream.com](https://pipedream.com) and press the **Sign In** button in the top-right to sign up for a Pipedream account:

![Sign up for Pipedream account](https://res.cloudinary.com/dkbxegavp/image/upload/v1591822072/dev.to%20posts/Screen_Shot_2020-06-10_at_1.38.36_PM_zrnmrj.png)

Once you've signed up, open [this Pipedream workflow](https://pipedream.com/@dylan/update-github-profile-with-my-most-recent-dev-post-p_YyCV6y/edit). Click the **Copy** button near the top-right to create a copy of the workflow in _your_ Pipedream account.

Once you copy the workflow, you'll be asked to enter information specific to your DEV account and your Github profile. The first step of the workflow is the **trigger** step. This workflow is triggered on new posts in an RSS feed. DEV generates an RSS feed for every user's posts at the URL `https://dev.to/feed/{username}`, so we'll use this to track new posts.

Replace `{username}` with your DEV username, and enter your DEV RSS URL in the **Feed URL** section of this step. By default, Pipedream will poll your RSS feed for new items every 15 minutes, which you can change:

<img src="https://res.cloudinary.com/dkbxegavp/image/upload/v1594441766/dev.to%20posts/Screen_Shot_2020-07-10_at_9.28.59_PM_tjldk4.png" alt="DEV RSS trigger step" width="600px"/>

The next step asks you to enter an **Owner** and **Repo** where your profile README lives. Enter your username in both fields:

<img src="https://res.cloudinary.com/dkbxegavp/image/upload/v1594442522/dev.to%20posts/Screen_Shot_2020-07-10_at_9.29.54_PM_qon31d.png" alt="Profile Repo" width="600px"/>

The remaining steps fetch the current version of the `README`, inserts the link for the newest post within the comments, and updates the `README` with the newest content, pushing the newest link live. Since these steps interact with the Github API, you'll need to connect your Github account to the relevant steps. Scroll through the workflow and press the **Connect Github** button in each step that requires it:

<img src="https://res.cloudinary.com/dkbxegavp/image/upload/v1594443047/dev.to%20posts/Screen_Shot_2020-07-10_at_9.50.28_PM_jhzyr1.png" alt="Connect Github button" width="200px"/>

Now, your workflow should be ready to run. Let's test it. At the top of your workflow, in the trigger step, you should see a sample event for the most recent post. You'll also see a **Send Test Event** button. Press it:

<img src="https://res.cloudinary.com/dkbxegavp/image/upload/v1594443250/dev.to%20posts/Screen_Shot_2020-07-10_at_9.52.40_PM_fbrbml.png" alt="Send Test Event" width="600px"/>

This should run your workflow, adding the link to your profile:

<img src="https://res.cloudinary.com/dkbxegavp/image/upload/v1594433532/dev.to%20posts/Screen_Shot_2020-07-10_at_7.11.45_PM_fpo5t2.png" alt="DEV post on profile" width="600px"/>

One final step - by default, the trigger step is turned **Off** so you can test your workflow without events triggering your code until you're ready. Now that the workflow works, turn it **On**:

<img src="https://res.cloudinary.com/dkbxegavp/image/upload/v1594513887/dev.to%20posts/Screen_Shot_2020-07-11_at_5.30.35_PM_uzguuf.png" alt="DEV post on profile" width="600px"/>

And that's it. New posts should trigger the workflow and update your profile automatically.

**You can extend this idea to any data source, updating your profile when that data changes**. Pipedream [event sources](https://docs.pipedream.com/event-sources/) allow you to trigger workflows on any event from any API, so you could trigger a profile rebuild on new tweets, new Github stars, changes to an Airtable table, and more! Try [creating another workflow](https://pipedream.com/new) to see what else you can build, and let me know if you have any questions in the comments!

---

_I wrote this article with [VS Code](https://code.visualstudio.com/), on my Mac, and published it by running `git push`. All my DEV posts are tracked by Git, and I can manage them from my local machine. Learn how to do this yourself!_

{% link https://dev.to/dylburger/publish-dev-articles-from-a-git-repo-with-github-pipedream-505j %}
