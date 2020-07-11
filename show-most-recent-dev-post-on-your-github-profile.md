---
title: Show your most recent DEV post on your Github profile with Pipedream
published: false
tags: github, pipedream, meta, tutorial
---

Github just launched a [`README` for your Github profile](https://dev.to/natterstefan/how-to-add-a-readme-to-your-github-profile-2bo9)! Since you can add any [Markdown](https://www.markdownguide.org/) to a `README`, you can now add images, links, and all sorts of other content to your profile.

I want to take this idea a step further: **what if you could update your profile _automatically_**? Each time you tweet, update your profile to display it. Each time you play a new song on Spotify, update your profile to show what you're currently listening to.

To see how this works, I'll show you how to use [Pipedream](https://pipedream.com) to display your most recent DEV post on your profile:

<img src="https://res.cloudinary.com/dkbxegavp/image/upload/v1594433532/dev.to%20posts/Screen_Shot_2020-07-10_at_7.11.45_PM_fpo5t2.png" alt="DEV post on profile" width="600px"/>

We'll use [this Pipedream workflow](https://pipedream.com/@dylan/update-github-profile-with-my-most-recent-dev-post-p_YyCV6y/edit?e=1eWKjpfvTujTCFtUwgWqhJ1Yrt2) to listen for new posts and update your profile `README` in Github. **When you publish a new post, the link on that `README` will automatically update**.

## **How this works**

---

_I wrote this article with [VS Code](https://code.visualstudio.com/), on my Mac, and published it by running `git push`. All my DEV posts are tracked by Git, and I can manage them from my local machine. Learn how to do this yourself!_

{% link https://dev.to/dylburger/publish-dev-articles-from-a-git-repo-with-github-pipedream-505j %}
